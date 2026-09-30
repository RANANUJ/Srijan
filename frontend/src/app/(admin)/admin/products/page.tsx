'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { getTenantProducts, createProduct, updateProduct, deleteProduct, addProductReview } from '@/lib/api';
import {
  Package,
  Plus,
  Download,
  Trash2,
  Edit3,
  Star,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Eye,
  X,
  MessageSquareQuote,
  Layers,
  Search,
} from 'lucide-react';
import Link from 'next/link';

interface ProductItem {
  id: string;
  title: string;
  slug: string;
  sku: string;
  price: number;
  mrp: number;
  description: string;
  ingredients?: string;
  benefits?: string;
  usage_instructions?: string;
  faqs_json?: string;
  status: string;
  media?: { id?: string; url: string }[];
  variants?: { id?: string; title: string; price: number; mrp: number; inventory_count: number }[];
  category?: { name: string };
}

export default function ProductsManagerPage() {
  const searchParams = useSearchParams();
  const tenantSlug = searchParams.get('tenant') || 'aura-beauty';

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'catalog' | 'reviews'>('catalog');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProductForReview, setSelectedProductForReview] = useState<ProductItem | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('1199');
  const [mrp, setMrp] = useState('1499');
  const [inventoryCount, setInventoryCount] = useState('50');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [benefits, setBenefits] = useState('');
  const [usageInstructions, setUsageInstructions] = useState('');
  const [categoryName, setCategoryName] = useState('Skincare & Beauty');
  const [status, setStatus] = useState('ACTIVE');

  // Multiple media images
  const [mediaUrls, setMediaUrls] = useState<string[]>([
    'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80',
  ]);
  const [newImageUrl, setNewImageUrl] = useState('');

  // Variants list
  const [variantsList, setVariantsList] = useState<{ title: string; price: number; mrp: number; inventory_count: number }[]>([
    { title: 'Standard 50ml', price: 1199, mrp: 1499, inventory_count: 50 },
  ]);

  // Review Form
  const [reviewAuthor, setReviewAuthor] = useState('');
  const [reviewRating, setReviewRating] = useState('5');
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewVerified, setReviewVerified] = useState(true);

  // Status message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, [tenantSlug]);

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  }

  async function loadProducts() {
    setLoading(true);
    try {
      const data = await getTenantProducts(tenantSlug);
      setProducts(data);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingProduct(null);
    setTitle('');
    setSku(`${tenantSlug.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`);
    setPrice('1199');
    setMrp('1499');
    setInventoryCount('50');
    setDescription('Formulated with active dermatological botanicals to deliver visible results.');
    setIngredients('2% Niacinamide, Hyaluronic Acid, Centella Asiatica, Green Tea Extract');
    setBenefits('96% reported improved radiance; Clinically proven to hydrate skin barrier within 1 hour.');
    setUsageInstructions('Massage 3-4 drops onto clean face & neck daily. Follow with SPF during the day.');
    setMediaUrls(['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80']);
    setVariantsList([{ title: 'Standard 50ml', price: 1199, mrp: 1499, inventory_count: 50 }]);
    setShowProductModal(true);
  }

  function openEditModal(prod: ProductItem) {
    setEditingProduct(prod);
    setTitle(prod.title);
    setSku(prod.sku);
    setPrice(String(prod.price));
    setMrp(String(prod.mrp));
    setDescription(prod.description || '');
    setIngredients(prod.ingredients || '');
    setBenefits(prod.benefits || '');
    setUsageInstructions(prod.usage_instructions || '');
    setStatus(prod.status || 'ACTIVE');

    const urls = prod.media && prod.media.length > 0 ? prod.media.map((m) => m.url) : ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80'];
    setMediaUrls(urls);

    if (prod.variants && prod.variants.length > 0) {
      setVariantsList(prod.variants.map((v) => ({ title: v.title, price: v.price, mrp: v.mrp, inventory_count: v.inventory_count })));
      setInventoryCount(String(prod.variants[0].inventory_count));
    } else {
      setVariantsList([{ title: 'Standard', price: prod.price, mrp: prod.mrp, inventory_count: 25 }]);
      setInventoryCount('25');
    }

    setShowProductModal(true);
  }

  function handleAddImageUrl() {
    if (!newImageUrl.trim()) return;
    setMediaUrls([...mediaUrls, newImageUrl.trim()]);
    setNewImageUrl('');
  }

  function handleRemoveImageUrl(idx: number) {
    setMediaUrls(mediaUrls.filter((_, i) => i !== idx));
  }

  function handleAddVariant() {
    setVariantsList([
      ...variantsList,
      {
        title: `Pack of ${variantsList.length + 1} / Deluxe`,
        price: Number(price) * 1.8,
        mrp: Number(mrp) * 1.8,
        inventory_count: 20,
      },
    ]);
  }

  function handleRemoveVariant(idx: number) {
    if (variantsList.length <= 1) return;
    setVariantsList(variantsList.filter((_, i) => i !== idx));
  }

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('srijan_token') || '';

    const payload = {
      title,
      price: Number(price),
      mrp: Number(mrp),
      sku,
      description,
      ingredients,
      benefits,
      usage_instructions: usageInstructions,
      status,
      media_urls: mediaUrls,
      variants: variantsList,
    };

    try {
      if (editingProduct) {
        await updateProduct(tenantSlug, token, editingProduct.id, payload);
        showToast(`Product "${title}" updated successfully!`);
      } else {
        await createProduct(tenantSlug, token, payload);
        showToast(`Product "${title}" published to catalog!`);
      }
      setShowProductModal(false);
      loadProducts();
    } catch (err: any) {
      alert(err.message || 'Failed to save product');
    }
  };

  const handleDeleteProduct = async (productId: string, prodTitle: string) => {
    if (!confirm(`Are you sure you want to remove "${prodTitle}" from your store? This action cannot be undone.`)) {
      return;
    }
    const token = localStorage.getItem('srijan_token') || '';
    try {
      await deleteProduct(tenantSlug, token, productId);
      showToast(`Removed "${prodTitle}" from catalog.`);
      loadProducts();
    } catch (err: any) {
      alert(err.message || 'Failed to delete product');
    }
  };

  const handleOpenReviewModal = (prod: ProductItem) => {
    setSelectedProductForReview(prod);
    setReviewAuthor('');
    setReviewRating('5');
    setReviewTitle('Absolutely life-changing formula!');
    setReviewComment('Visible difference within 5 days. My skin has never looked so clear and hydrated. Worth every rupee!');
    setReviewVerified(true);
    setShowReviewModal(true);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForReview) return;

    try {
      await addProductReview(tenantSlug, selectedProductForReview.id, {
        author: reviewAuthor || 'Verified Customer',
        rating: Number(reviewRating),
        title: reviewTitle,
        comment: reviewComment,
        verified: reviewVerified,
      });

      showToast(`Customer review added for ${selectedProductForReview.title}!`);
      setShowReviewModal(false);
      loadProducts();
    } catch (err: any) {
      alert(err.message || 'Failed to submit review');
    }
  };

  const handleExportCsv = () => {
    const csvRows = ['ID,Title,SKU,Price,MRP,Stock,Status,Ingredients,Benefits'];
    products.forEach((p) => {
      const v = p.variants && p.variants[0] ? p.variants[0] : null;
      csvRows.push(
        `"${p.id}","${p.title.replace(/"/g, '""')}","${p.sku}",${p.price},${p.mrp},${v ? v.inventory_count : 0},"${p.status}","${(p.ingredients || '').replace(/"/g, '""')}","${(p.benefits || '').replace(/"/g, '""')}"`
      );
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tenantSlug}-full-catalog-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Helper to extract reviews from product
  function getReviews(prod: ProductItem) {
    try {
      if (!prod.faqs_json) return [];
      const parsed = JSON.parse(prod.faqs_json);
      return Array.isArray(parsed.reviews) ? parsed.reviews : [];
    } catch {
      return [];
    }
  }

  const filteredProducts = products.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#070A11] text-white p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-6 right-6 z-50 bg-emerald-500 text-black px-5 py-3 rounded-xl shadow-2xl font-bold text-xs flex items-center space-x-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Brand Admin Role Disclaimer & Header */}
        <div className="bg-gradient-to-r from-blue-900/30 via-purple-900/20 to-transparent border border-blue-500/20 rounded-2xl p-6 backdrop-blur-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="bg-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-blue-500/30">
                  Brand Store Manager
                </span>
                <span className="text-gray-500">•</span>
                <span className="text-xs text-gray-400 font-mono">Store: {tenantSlug}</span>
              </div>
              <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-white mt-1 flex items-center space-x-2">
                <Package className="w-7 h-7 text-blue-400" />
                <span>Product Catalog & Customer Reviews</span>
              </h1>
              <p className="text-xs text-gray-300 mt-1 max-w-3xl leading-relaxed">
                Add, manage, and remove brand items, upload high-res product galleries, configure formulations &amp; ingredients (Pilgrim / Foxtale / Ghar Soaps standard), and moderate verified customer reviews.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleExportCsv}
                className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all"
              >
                <Download className="w-4 h-4 text-gray-300" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={openCreateModal}
                className="gradient-btn px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center space-x-2 shadow-lg shadow-purple-600/30 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-400">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>
                Theme, website architecture, and custom domain are locked &amp; managed by <strong className="text-white">Super Admin</strong>.
              </span>
            </div>
            <Link
              href={`/products/${products[0]?.slug || ''}?tenant=${tenantSlug}`}
              target="_blank"
              className="text-blue-400 hover:text-blue-300 flex items-center space-x-1"
            >
              <span>Preview Live Storefront</span>
              <Eye className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Tab & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-2 bg-white/5 p-1 rounded-xl border border-white/10 w-fit">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'catalog' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              All Products ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
                activeTab === 'reviews' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>Customer Reviews Hub</span>
            </button>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by title, SKU, keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* TAB 1: PRODUCT CATALOG TABLE */}
        {activeTab === 'catalog' && (
          <div className="glass-panel border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            {loading ? (
              <div className="py-20 text-center text-gray-400">Loading catalog items...</div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-20 text-center space-y-3">
                <Package className="w-12 h-12 text-gray-600 mx-auto" />
                <h3 className="text-base font-bold text-white">No products found</h3>
                <p className="text-xs text-gray-400">Get started by creating your first product with multiple images and descriptions.</p>
                <button onClick={openCreateModal} className="gradient-btn px-4 py-2 text-xs font-bold uppercase rounded-lg">
                  Add First Product
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-300">
                  <thead className="bg-white/5 border-b border-white/10 text-gray-400 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-4 px-6">Product &amp; Gallery</th>
                      <th className="py-4 px-4">SKU</th>
                      <th className="py-4 px-4">Price &amp; MRP</th>
                      <th className="py-4 px-4">Inventory</th>
                      <th className="py-4 px-4">Customer Reviews</th>
                      <th className="py-4 px-4">Status</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredProducts.map((p) => {
                      const v = p.variants && p.variants[0] ? p.variants[0] : null;
                      const reviews = getReviews(p);
                      const discount = p.mrp > p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0;
                      const coverImg =
                        p.media && p.media.length > 0
                          ? p.media[0].url
                          : 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=120&auto=format&fit=crop&q=80';

                      return (
                        <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-3.5">
                              <div className="relative flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden border border-white/10 bg-black/40">
                                <img src={coverImg} alt={p.title} className="w-full h-full object-cover" />
                                {p.media && p.media.length > 1 && (
                                  <span className="absolute bottom-1 right-1 bg-black/80 text-[9px] font-bold px-1 rounded text-white">
                                    +{p.media.length - 1}
                                  </span>
                                )}
                              </div>
                              <div>
                                <div className="font-bold text-white text-sm hover:text-blue-400 transition-colors">
                                  {p.title}
                                </div>
                                <div className="flex items-center space-x-2 mt-0.5">
                                  <span className="text-[10px] text-purple-400 font-medium">{p.category?.name || 'Skincare & Beauty'}</span>
                                  {p.media && (
                                    <span className="text-[10px] text-gray-500">• {p.media.length} image{p.media.length > 1 ? 's' : ''}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-4 font-mono text-gray-400">{p.sku}</td>

                          <td className="py-4 px-4">
                            <div className="font-extrabold text-white text-sm">₹{p.price}</div>
                            {p.mrp > p.price && (
                              <div className="text-[10px] text-gray-500 line-through">
                                ₹{p.mrp} <span className="text-emerald-400 no-underline font-semibold ml-1">({discount}% OFF)</span>
                              </div>
                            )}
                          </td>

                          <td className="py-4 px-4">
                            <span
                              className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                                (v?.inventory_count || 0) > 10
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : (v?.inventory_count || 0) > 0
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              }`}
                            >
                              {v ? v.inventory_count : 0} in stock
                            </span>
                          </td>

                          <td className="py-4 px-4">
                            <button
                              onClick={() => handleOpenReviewModal(p)}
                              className="group flex items-center space-x-1.5 hover:text-white transition-colors"
                            >
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              <span className="font-bold text-white">{reviews.length > 0 ? reviews.length : 0} reviews</span>
                              <span className="text-[10px] text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                                +Add
                              </span>
                            </button>
                          </td>

                          <td className="py-4 px-4">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                p.status === 'ACTIVE'
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : 'bg-gray-500/20 text-gray-400'
                              }`}
                            >
                              {p.status}
                            </span>
                          </td>

                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => openEditModal(p)}
                                title="Edit Product Details & Gallery"
                                className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <Link
                                href={`/products/${p.slug}?tenant=${tenantSlug}`}
                                target="_blank"
                                title="View Customer Storefront Page"
                                className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-blue-400 transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={() => handleDeleteProduct(p.id, p.title)}
                                title="Delete Product"
                                className="p-2 hover:bg-rose-500/20 rounded-lg text-gray-400 hover:text-rose-400 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: REVIEWS HUB */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-panel p-6 rounded-2xl border border-white/10">
                <div className="text-gray-400 text-xs font-semibold uppercase">Total Customer Reviews</div>
                <div className="text-3xl font-black text-white mt-2">
                  {products.reduce((acc, p) => acc + getReviews(p).length, 0)}
                </div>
                <div className="text-xs text-emerald-400 font-semibold mt-1">100% Verified Buyer Ratings</div>
              </div>
              <div className="glass-panel p-6 rounded-2xl border border-white/10">
                <div className="text-gray-400 text-xs font-semibold uppercase">Average Store Rating</div>
                <div className="text-3xl font-black text-amber-400 mt-2 flex items-center space-x-2">
                  <span>4.9</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
                <div className="text-xs text-gray-400 mt-1">Based on genuine reviews</div>
              </div>
              <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col justify-between">
                <div>
                  <div className="text-gray-400 text-xs font-semibold uppercase">Collect Brand Reviews</div>
                  <p className="text-xs text-gray-300 mt-1">
                    Boost conversion up to 48% like Pilgrim &amp; Nykaa by showcasing real testimonials.
                  </p>
                </div>
                {products.length > 0 && (
                  <button
                    onClick={() => handleOpenReviewModal(products[0])}
                    className="gradient-btn px-4 py-2 rounded-xl text-xs font-bold uppercase mt-3"
                  >
                    Add Testimonial / Review
                  </button>
                )}
              </div>
            </div>

            {/* List of all reviews across products */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
              <h3 className="font-heading text-lg font-bold text-white flex items-center space-x-2">
                <MessageSquareQuote className="w-5 h-5 text-purple-400" />
                <span>Customer Feedback Log</span>
              </h3>

              <div className="divide-y divide-white/5">
                {products.flatMap((p) =>
                  getReviews(p).map((rev: any) => ({ ...rev, productTitle: p.title, productId: p.id, productSlug: p.slug }))
                ).length === 0 ? (
                  <div className="py-12 text-center text-gray-400 text-xs">
                    No reviews recorded yet. Click on any product or the button above to add customer testimonials!
                  </div>
                ) : (
                  products
                    .flatMap((p) =>
                      getReviews(p).map((rev: any) => ({ ...rev, productTitle: p.title, productId: p.id, productSlug: p.slug }))
                    )
                    .map((r: any, idx: number) => (
                      <div key={idx} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-white text-sm">{r.author}</span>
                            {r.verified && (
                              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Verified Buyer</span>
                              </span>
                            )}
                            <span className="text-[10px] text-gray-500">• {r.date}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            {Array.from({ length: r.rating || 5 }).map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            ))}
                            <span className="text-xs font-bold text-gray-200 ml-2">{r.title}</span>
                          </div>
                          <p className="text-xs text-gray-400 leading-relaxed max-w-2xl">{r.comment}</p>
                        </div>

                        <div className="text-right">
                          <div className="text-[11px] text-gray-400">On Product:</div>
                          <Link
                            href={`/products/${r.productSlug}?tenant=${tenantSlug}`}
                            target="_blank"
                            className="text-xs font-semibold text-blue-400 hover:underline"
                          >
                            {r.productTitle}
                          </Link>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* MODAL 1: ADD / EDIT PRODUCT */}
        {showProductModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="glass-panel p-6 sm:p-8 max-w-3xl w-full my-8 rounded-2xl border border-white/20 max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <div>
                  <h3 className="font-heading text-xl font-bold text-white">
                    {editingProduct ? `Edit Product: ${editingProduct.title}` : 'Add New Product to Brand'}
                  </h3>
                  <p className="text-xs text-gray-400">Fill in full formulation, multiple gallery images, and variant prices.</p>
                </div>
                <button onClick={() => setShowProductModal(false)} className="text-gray-400 hover:text-white p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-6">
                {/* 1. General Info */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center space-x-1.5">
                    <Package className="w-4 h-4" />
                    <span>Basic Details</span>
                  </h4>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Product Title *</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. 24K Saffron Glow Facial Oil or Cold Process Sandalwood Bar"
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1">Selling Price (₹) *</label>
                      <input
                        type="number"
                        required
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white font-bold text-emerald-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1">MRP (₹) *</label>
                      <input
                        type="number"
                        required
                        value={mrp}
                        onChange={(e) => setMrp(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white text-gray-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1">SKU *</label>
                      <input
                        type="text"
                        required
                        value={sku}
                        onChange={(e) => setSku(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Description</label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Rich sensory experience, formulation narrative, and core value proposition..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* 2. Multiple Media Images */}
                <div className="space-y-4 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center space-x-1.5">
                      <ImageIcon className="w-4 h-4" />
                      <span>Multiple Product Gallery Images ({mediaUrls.length})</span>
                    </h4>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {mediaUrls.map((url, idx) => (
                      <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-white/10 bg-black/50">
                        <img src={url} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImageUrl(idx)}
                          className="absolute top-1.5 right-1.5 bg-rose-600/80 hover:bg-rose-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        {idx === 0 && (
                          <span className="absolute bottom-1.5 left-1.5 bg-blue-600 text-[9px] font-bold px-1.5 py-0.5 rounded text-white">
                            Cover Image
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="Paste high-res image URL (e.g. Unsplash or Cloudinary)..."
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="bg-purple-600 hover:bg-purple-500 px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all flex items-center space-x-1"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Image</span>
                    </button>
                  </div>
                </div>

                {/* 3. D2C Rich Specifications (Pilgrim / Foxtale / Ghar Soaps style) */}
                <div className="space-y-4 pt-4 border-t border-white/10">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>D2C Brand Formulation &amp; Clinical Details</span>
                  </h4>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Key Ingredients &amp; Active Compounds (Pilgrim / Foxtale Style)
                    </label>
                    <input
                      type="text"
                      value={ingredients}
                      onChange={(e) => setIngredients(e.target.value)}
                      placeholder="e.g. 2% Niacinamide, French Red Vine Extract, Alpha Arbutin, 100% Cold-Pressed Sandalwood Oil"
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1">Clinically Proven Benefits</label>
                      <textarea
                        rows={2}
                        value={benefits}
                        onChange={(e) => setBenefits(e.target.value)}
                        placeholder="e.g. 94% noticed visibly brighter skin in 14 days; BIS 916 Gold Certified hallmark"
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1">How to Use / Usage Instructions</label>
                      <textarea
                        rows={2}
                        value={usageInstructions}
                        onChange={(e) => setUsageInstructions(e.target.value)}
                        placeholder="e.g. Lather onto wet skin gently in circular motions, rinse thoroughly with tepid water."
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Variants Manager */}
                <div className="space-y-3 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-1.5">
                      <Layers className="w-4 h-4" />
                      <span>Sizes / Variants &amp; Stock Counts</span>
                    </h4>
                    <button
                      type="button"
                      onClick={handleAddVariant}
                      className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Size Variant</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {variantsList.map((v, idx) => (
                      <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-white/5 p-2 rounded-xl border border-white/10">
                        <div className="col-span-5">
                          <input
                            type="text"
                            value={v.title}
                            onChange={(e) => {
                              const updated = [...variantsList];
                              updated[idx].title = e.target.value;
                              setVariantsList(updated);
                            }}
                            placeholder="Variant Title (e.g. 50ml / 100ml / 22K Gold)"
                            className="w-full bg-transparent text-xs text-white focus:outline-none"
                          />
                        </div>
                        <div className="col-span-3">
                          <input
                            type="number"
                            value={v.price}
                            onChange={(e) => {
                              const updated = [...variantsList];
                              updated[idx].price = Number(e.target.value);
                              setVariantsList(updated);
                            }}
                            placeholder="Price"
                            className="w-full bg-transparent text-xs text-emerald-400 font-bold focus:outline-none"
                          />
                        </div>
                        <div className="col-span-3">
                          <input
                            type="number"
                            value={v.inventory_count}
                            onChange={(e) => {
                              const updated = [...variantsList];
                              updated[idx].inventory_count = Number(e.target.value);
                              setVariantsList(updated);
                            }}
                            placeholder="Stock"
                            className="w-full bg-transparent text-xs text-white focus:outline-none"
                          />
                        </div>
                        <div className="col-span-1 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveVariant(idx)}
                            className="text-gray-500 hover:text-rose-400 p-1"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-6 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowProductModal(false)}
                    className="px-5 py-2.5 text-xs text-gray-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="gradient-btn px-6 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-purple-600/30"
                  >
                    {editingProduct ? 'Save Changes' : 'Publish Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: ADD CUSTOMER REVIEW */}
        {showReviewModal && selectedProductForReview && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="glass-panel p-6 sm:p-8 max-w-lg w-full rounded-2xl border border-white/20 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                <div>
                  <h3 className="font-heading text-lg font-bold text-white">Add Verified Customer Review</h3>
                  <p className="text-xs text-gray-400">For product: {selectedProductForReview.title}</p>
                </div>
                <button onClick={() => setShowReviewModal(false)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Customer Name</label>
                  <input
                    type="text"
                    required
                    value={reviewAuthor}
                    onChange={(e) => setReviewAuthor(e.target.value)}
                    placeholder="e.g. Radhika Menon, Mumbai"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Star Rating (1 to 5)</label>
                  <select
                    value={reviewRating}
                    onChange={(e) => setReviewRating(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white"
                  >
                    <option value="5" className="bg-gray-900">★★★★★ 5 Stars (Outstanding)</option>
                    <option value="4" className="bg-gray-900">★★★★☆ 4 Stars (Very Good)</option>
                    <option value="3" className="bg-gray-900">★★★☆☆ 3 Stars (Average)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Review Headline</label>
                  <input
                    type="text"
                    required
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    placeholder="e.g. Cleared my dark spots in 2 weeks!"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Review Experience &amp; Feedback</label>
                  <textarea
                    rows={3}
                    required
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Full testimonial about the packaging, quality, and results..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="checkbox"
                    id="verifiedCheck"
                    checked={reviewVerified}
                    onChange={(e) => setReviewVerified(e.target.checked)}
                    className="rounded bg-white/5 border-white/10 text-blue-600"
                  />
                  <label htmlFor="verifiedCheck" className="text-xs text-gray-300 cursor-pointer">
                    Mark as Verified Buyer Badge
                  </label>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    className="px-4 py-2 text-xs text-gray-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="gradient-btn px-5 py-2 text-xs font-bold uppercase rounded-xl"
                  >
                    Publish Review
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
