import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { TenantRequest } from '../../common/middleware/tenant-resolver.middleware';

@Controller('api/v1/catalog')
export class CatalogController {
  constructor(private catalogService: CatalogService) {}

  @Get('categories')
  async getCategories(@Req() req: TenantRequest) {
    return this.catalogService.getCategories(req.tenant.id);
  }

  @Post('categories')
  async createCategory(@Req() req: TenantRequest, @Body() body: any) {
    return this.catalogService.createCategory(req.tenant.id, body);
  }

  @Get('products')
  async getProducts(
    @Req() req: TenantRequest,
    @Query('category') categorySlug?: string,
    @Query('collection') collectionSlug?: string,
    @Query('bestseller') isBestseller?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('limit') limit?: number,
  ) {
    return this.catalogService.getProducts(req.tenant.id, {
      categorySlug,
      collectionSlug,
      isBestseller: isBestseller === 'true',
      search,
      status,
      limit,
    });
  }

  @Get('products/:slug')
  async getProductBySlug(@Req() req: TenantRequest, @Param('slug') slug: string) {
    return this.catalogService.getProductBySlug(req.tenant.id, slug);
  }

  @Post('products')
  async createProduct(@Req() req: TenantRequest, @Body() body: any) {
    return this.catalogService.createProduct(req.tenant.id, body);
  }

  @Put('variants/:id/inventory')
  async updateInventory(
    @Req() req: TenantRequest,
    @Param('id') variantId: string,
    @Body('inventory_count') count: number,
  ) {
    return this.catalogService.updateInventory(req.tenant.id, variantId, count);
  }

  @Get('collections')
  async getCollections(@Req() req: TenantRequest) {
    return this.catalogService.getCollections(req.tenant.id);
  }

  @Get('collections/:slug')
  async getCollectionBySlug(@Req() req: TenantRequest, @Param('slug') slug: string) {
    return this.catalogService.getCollectionBySlug(req.tenant.id, slug);
  }

  @Put('products/:id')
  async updateProduct(
    @Req() req: TenantRequest,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.catalogService.updateProduct(req.tenant.id, id, body);
  }

  @Delete('products/:id')
  async deleteProduct(@Req() req: TenantRequest, @Param('id') id: string) {
    return this.catalogService.deleteProduct(req.tenant.id, id);
  }

  @Post('products/:id/reviews')
  async addProductReview(
    @Req() req: TenantRequest,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.catalogService.addProductReview(req.tenant.id, id, body);
  }
}

