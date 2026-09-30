import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class CatalogService {
  constructor(private prisma: PrismaService) {}

  // ----------------------------------------------------
  // CATEGORIES
  // ----------------------------------------------------
  async getCategories(tenantId: string) {
    return this.prisma.category.findMany({
      where: { tenant_id: tenantId },
      include: {
        _count: { select: { products: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async createCategory(tenantId: string, dto: any) {
    const slug = dto.slug || dto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return this.prisma.category.create({
      data: {
        tenant_id: tenantId,
        name: dto.name,
        slug,
        description: dto.description,
        image_url: dto.image_url,
      },
    });
  }

  // ----------------------------------------------------
  // PRODUCTS & VARIANTS
  // ----------------------------------------------------
  async getProducts(
    tenantId: string,
    query: {
      categorySlug?: string;
      collectionSlug?: string;
      isBestseller?: boolean;
      search?: string;
      status?: string;
      limit?: number;
    } = {},
  ) {
    const where: any = { tenant_id: tenantId };

    if (query.status) {
      where.status = query.status;
    } else {
      where.status = 'ACTIVE';
    }

    if (query.isBestseller) {
      where.is_bestseller = true;
    }

    if (query.categorySlug) {
      const category = await this.prisma.category.findFirst({
        where: { tenant_id: tenantId, slug: query.categorySlug },
      });
      if (category) {
        where.category_id = category.id;
      }
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search } },
        { description: { contains: query.search } },
        { sku: { contains: query.search } },
      ];
    }

    const products = await this.prisma.product.findMany({
      where,
      include: {
        category: true,
        variants: true,
        media: true,
      },
      take: query.limit ? Number(query.limit) : 50,
      orderBy: { created_at: 'desc' },
    });

    return products;
  }

  async getProductBySlug(tenantId: string, slug: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        tenant_id: tenantId,
        slug,
      },
      include: {
        category: true,
        variants: true,
        media: true,
      },
    });

    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async createProduct(tenantId: string, dto: any) {
    const slug = dto.slug || dto.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const product = await this.prisma.product.create({
      data: {
        tenant_id: tenantId,
        title: dto.title,
        slug,
        description: dto.description,
        category_id: dto.category_id,
        mrp: Number(dto.mrp),
        price: Number(dto.price),
        sku: dto.sku,
        barcode: dto.barcode,
        weight_grams: dto.weight_grams ? Number(dto.weight_grams) : null,
        ingredients: dto.ingredients,
        benefits: dto.benefits,
        usage_instructions: dto.usage_instructions,
        faqs_json: dto.faqs_json ? JSON.stringify(dto.faqs_json) : null,
        is_bestseller: dto.is_bestseller || false,
        is_new_launch: dto.is_new_launch !== undefined ? dto.is_new_launch : true,
        seo_title: dto.seo_title || dto.title,
        seo_description: dto.seo_description || dto.description.slice(0, 160),
      },
    });

    // Create default variant if provided
    if (dto.variants && Array.isArray(dto.variants) && dto.variants.length > 0) {
      for (const v of dto.variants) {
        await this.prisma.productVariant.create({
          data: {
            tenant_id: tenantId,
            product_id: product.id,
            title: v.title || 'Default',
            sku: v.sku || `${dto.sku}-${v.title}`,
            price: Number(v.price || dto.price),
            mrp: Number(v.mrp || dto.mrp),
            inventory_count: Number(v.inventory_count || 10),
            image_url: v.image_url,
          },
        });
      }
    } else {
      // Default single variant
      await this.prisma.productVariant.create({
        data: {
          tenant_id: tenantId,
          product_id: product.id,
          title: 'Standard',
          sku: dto.sku,
          price: Number(dto.price),
          mrp: Number(dto.mrp),
          inventory_count: Number(dto.inventory_count || 25),
        },
      });
    }

    // Media
    if (dto.media_urls && Array.isArray(dto.media_urls)) {
      for (let i = 0; i < dto.media_urls.length; i++) {
        await this.prisma.productMedia.create({
          data: {
            tenant_id: tenantId,
            product_id: product.id,
            url: dto.media_urls[i],
            sort_order: i,
          },
        });
      }
    }

    return this.getProductBySlug(tenantId, slug);
  }

  // ----------------------------------------------------
  // BULK CSV PRODUCT IMPORTER (CAT-4 Isolation Rule)
  // ----------------------------------------------------
  async bulkImportCsvProducts(tenantId: string, csvContent: string) {
    const lines = csvContent.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length < 2) {
      throw new BadRequestException('CSV file must contain a header and at least one data row.');
    }

    const header = lines[0].toLowerCase().split(',');
    let importedCount = 0;
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      try {
        const row = lines[i].split(',').map(cell => cell.replace(/^"|"$/g, '').trim());
        const title = row[0];
        const price = parseFloat(row[1]) || 499;
        const mrp = parseFloat(row[2]) || price * 1.2;
        const sku = row[3] || `SKU-${Date.now()}-${i}`;
        const stock = parseInt(row[4], 10) || 20;

        if (!title) continue;

        await this.createProduct(tenantId, {
          title,
          price,
          mrp,
          sku,
          inventory_count: stock,
          description: `${title} - Clean, high-performance formulation.`,
        });

        importedCount++;
      } catch (err: any) {
        errors.push(`Row ${i}: ${err.message}`);
      }
    }

    return {
      success: true,
      totalRowsProcessed: lines.length - 1,
      importedCount,
      errors,
    };
  }

  async updateInventory(tenantId: string, variantId: string, count: number) {
    const variant = await this.prisma.productVariant.findFirst({
      where: { id: variantId, tenant_id: tenantId },
    });

    if (!variant) throw new NotFoundException('Variant not found');

    return this.prisma.productVariant.update({
      where: { id: variantId },
      data: { inventory_count: count },
    });
  }

  // ----------------------------------------------------
  // COLLECTIONS & BESTSELLERS
  // ----------------------------------------------------
  async getCollections(tenantId: string) {
    return this.prisma.collection.findMany({
      where: { tenant_id: tenantId },
      include: {
        products: {
          include: {
            product: {
              include: { media: true, variants: true },
            },
          },
        },
      },
    });
  }

  async getCollectionBySlug(tenantId: string, slug: string) {
    const collection = await this.prisma.collection.findFirst({
      where: { tenant_id: tenantId, slug },
      include: {
        products: {
          include: {
            product: {
              include: { media: true, variants: true, category: true },
            },
          },
        },
      },
    });

    if (!collection) throw new NotFoundException('Collection not found');
    return collection;
  }

  // ----------------------------------------------------
  // PRODUCT DELETION & UPDATES
  // ----------------------------------------------------
  async deleteProduct(tenantId: string, productId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, tenant_id: tenantId },
    });

    if (!product) throw new NotFoundException('Product not found');

    await this.prisma.product.delete({
      where: { id: productId },
    });

    return { success: true, message: 'Product deleted successfully' };
  }

  async updateProduct(tenantId: string, productId: string, dto: any) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, tenant_id: tenantId },
    });

    if (!product) throw new NotFoundException('Product not found');

    const updateData: any = {};
    if (dto.title) updateData.title = dto.title;
    if (dto.price !== undefined) updateData.price = Number(dto.price);
    if (dto.mrp !== undefined) updateData.mrp = Number(dto.mrp);
    if (dto.description) updateData.description = dto.description;
    if (dto.ingredients) updateData.ingredients = dto.ingredients;
    if (dto.benefits) updateData.benefits = dto.benefits;
    if (dto.usage_instructions) updateData.usage_instructions = dto.usage_instructions;
    if (dto.faqs_json) updateData.faqs_json = typeof dto.faqs_json === 'string' ? dto.faqs_json : JSON.stringify(dto.faqs_json);
    if (dto.is_bestseller !== undefined) updateData.is_bestseller = dto.is_bestseller;
    if (dto.status) updateData.status = dto.status;

    const updated = await this.prisma.product.update({
      where: { id: productId },
      data: updateData,
    });

    // Update media if provided
    if (dto.media_urls && Array.isArray(dto.media_urls)) {
      await this.prisma.productMedia.deleteMany({ where: { product_id: productId } });
      for (let i = 0; i < dto.media_urls.length; i++) {
        await this.prisma.productMedia.create({
          data: {
            tenant_id: tenantId,
            product_id: productId,
            url: dto.media_urls[i],
            sort_order: i,
          },
        });
      }
    }

    return this.getProductBySlug(tenantId, updated.slug);
  }

  // ----------------------------------------------------
  // PRODUCT REVIEWS
  // ----------------------------------------------------
  async addProductReview(tenantId: string, productId: string, review: any) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, tenant_id: tenantId },
    });

    if (!product) throw new NotFoundException('Product not found');

    let meta: any = {};
    try {
      meta = product.faqs_json ? JSON.parse(product.faqs_json) : {};
    } catch {
      meta = {};
    }

    if (!Array.isArray(meta.reviews)) {
      meta.reviews = [];
    }

    const newReview = {
      id: 'rev_' + Date.now(),
      author: review.author || 'Verified Buyer',
      rating: Number(review.rating) || 5,
      title: review.title || 'Outstanding quality!',
      comment: review.comment || 'Exceeded my expectations, fast shipping and superb packaging.',
      verified: review.verified !== undefined ? review.verified : true,
      date: new Date().toISOString().split('T')[0],
    };

    meta.reviews.unshift(newReview);

    await this.prisma.product.update({
      where: { id: productId },
      data: { faqs_json: JSON.stringify(meta) },
    });

    return { success: true, review: newReview, reviews: meta.reviews };
  }
}

