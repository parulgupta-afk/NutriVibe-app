import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiHeart, FiTrash2, FiCamera } from 'react-icons/fi';
import { favoritesApi } from '../api/favorites';
import ProductImage from '../components/common/ProductImage';

/**
 * Phase 15: list saved products for quick re-open.
 */
const Favorites = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await favoritesApi.list();
      setItems(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load saved products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRemove = async (id) => {
    try {
      await favoritesApi.remove(id);
      setItems((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <FiHeart className="text-primary-600 text-xl" aria-hidden="true" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Saved products</h1>
      </div>

      {loading && (
        <div className="flex justify-center py-12" role="status">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
          <span className="sr-only">Loading…</span>
        </div>
      )}

      {error && (
        <p className="text-red-600 text-sm mb-4" role="alert">{error}</p>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="card text-center py-12 text-gray-500 dark:text-gray-400">
          <p className="mb-2">No saved products yet.</p>
          <p className="text-sm mb-4">Open a product and tap Save to bookmark it here.</p>
          <Link to="/scanner" className="btn-primary inline-flex items-center gap-2">
            <FiCamera /> Scan a product
          </Link>
        </div>
      )}

      <ul className="space-y-3">
        {items.map((p) => (
          <li key={p._id} className="card flex items-center gap-4 !p-4">
            <ProductImage src={p.images?.[0]} alt={p.name} size={56} />
            <div className="flex-1 min-w-0">
              <button
                type="button"
                className="text-left font-medium text-gray-900 dark:text-gray-100 hover:text-primary-600 truncate block w-full"
                onClick={() => navigate(`/product/${p.barcode}`)}
              >
                {p.name}
              </button>
              <p className="text-sm text-gray-500 truncate">{p.brand}</p>
            </div>
            <button
              type="button"
              className="p-2 text-gray-400 hover:text-red-600 rounded-lg"
              aria-label={`Remove ${p.name} from saved`}
              onClick={() => handleRemove(p._id)}
            >
              <FiTrash2 />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Favorites;
