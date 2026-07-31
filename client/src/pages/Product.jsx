import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productApi } from '../api/products';
import { useProfile } from '../contexts/ProfileContext';
import ProductImage from '../components/common/ProductImage';
import { 
  FiArrowLeft, FiShield, FiAlertTriangle, FiCheckCircle, 
  FiInfo, FiActivity, FiStar, FiClock, FiCalendar,
  FiThumbsUp, FiThumbsDown, FiTrendingUp, FiFileText,
  FiExternalLink, FiCopy, FiHeart, FiUsers, FiZap
} from 'react-icons/fi';

const Product = () => {
  const { barcode } = useParams();
  const navigate = useNavigate();
  const { activeProfileId, activeProfileName } = useProfile();
  const [product, setProduct] = useState(null);
  const [safetyReport, setSafetyReport] = useState(null);
  const [alternatives, setAlternatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [logging, setLogging] = useState(false);
  const [explanation, setExplanation] = useState(null);
  const [explainLoading, setExplainLoading] = useState(false);
  const [explainError, setExplainError] = useState(null);
  const [refreshingImage, setRefreshingImage] = useState(false);
  const [imageRefreshMessage, setImageRefreshMessage] = useState(null);

  useEffect(() => {
    loadProductData();
    setExplanation(null);
    setExplainError(null);
  }, [barcode, activeProfileId]);

  const loadProductData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load product details, personalized to whichever profile is active
      const response = await productApi.searchByBarcode(barcode, activeProfileId);
      const productData = response.data;
      setProduct(productData);

      // The barcode lookup already returns a personalized safety report,
      // so use it directly instead of firing a second request
      if (response.safetyReport) {
        setSafetyReport(response.safetyReport);
      }

      // Load alternatives, personalized to the same active profile
      try {
        const altData = await productApi.getAlternatives(productData._id, activeProfileId);
        setAlternatives(altData.alternatives || []);
      } catch (err) {
        console.log('Alternatives not available');
      }
    } catch (err) {
      setError('Product not found. Please try another barcode.');
      console.error('Error loading product:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogProduct = async () => {
    setLogging(true);
    try {
      await productApi.logProduct(product._id, 1, activeProfileId);
      alert(`Product logged successfully for ${activeProfileName}!`);
    } catch (err) {
      console.error('Error logging product:', err);
      alert('Failed to log product. Please try again.');
    } finally {
      setLogging(false);
    }
  };

  const handleExplain = async () => {
    setExplainLoading(true);
    setExplainError(null);
    try {
      const response = await productApi.explainProduct(product._id, activeProfileId);
      setExplanation(response.explanation);
    } catch (err) {
      const message = err.response?.data?.message || 'Could not generate an explanation right now.';
      setExplainError(message);
      console.error('Explain error:', err);
    } finally {
      setExplainLoading(false);
    }
  };

  const handleRefreshImage = async () => {
    setRefreshingImage(true);
    setImageRefreshMessage(null);
    try {
      const response = await productApi.refreshImage(product._id);
      setImageRefreshMessage(response.message);
      if (response.found) {
        setProduct((prev) => ({ ...prev, images: response.images }));
      }
    } catch (err) {
      setImageRefreshMessage(err.response?.data?.message || 'Could not check for an image right now.');
    } finally {
      setRefreshingImage(false);
    }
  };

  const getSafetyColor = (level) => {
    switch (level) {
      case 'Safe': return 'green';
      case 'Caution': return 'yellow';
      case 'Unsafe': return 'red';
      default: return 'gray';
    }
  };

  const getSafetyIcon = (level) => {
    switch (level) {
      case 'Safe': return <FiCheckCircle className="text-3xl text-green-500" />;
      case 'Caution': return <FiAlertTriangle className="text-3xl text-yellow-500" />;
      case 'Unsafe': return <FiAlertTriangle className="text-3xl text-red-500" />;
      default: return <FiInfo className="text-3xl text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <FiAlertTriangle className="text-4xl text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button onClick={() => navigate('/scanner')} className="btn-primary">
            Scan Another Product
          </button>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const safetyLevel = safetyReport?.riskAssessment?.level || 'Unknown';
  const safetyColor = getSafetyColor(safetyLevel);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/scanner')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <FiArrowLeft /> Back to Scanner
      </button>

      {/* Viewing-for-profile indicator */}
      <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
        <FiUsers className="text-primary-500" />
        Viewing safety verdict for: <span className="font-semibold text-gray-700">{activeProfileName}</span>
      </div>

      {/* Product Header */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="flex items-start gap-4 flex-1">
            {product.images && product.images.length > 0 ? (
              <ProductImage src={product.images[0]} alt={product.name} size={96} />
            ) : (
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <ProductImage src={null} alt={product.name} size={96} />
                {product.dataSource !== 'OCR Scan' && (
                  <button
                    onClick={handleRefreshImage}
                    disabled={refreshingImage}
                    className="text-xs text-primary-600 hover:text-primary-700 whitespace-nowrap"
                  >
                    {refreshingImage ? 'Checking...' : 'Check for photo'}
                  </button>
                )}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
              <p className="text-gray-600">{product.brand}</p>
              <p className="text-sm text-gray-500 mt-1">Barcode: {product.barcode}</p>
            </div>
          </div>
          <button
            onClick={handleLogProduct}
            disabled={logging}
            className="btn-primary flex items-center gap-2 whitespace-nowrap"
          >
            <FiHeart />
            {logging ? 'Logging...' : 'Log This'}
          </button>
        </div>
      </div>

      {imageRefreshMessage && (
        <div className="mb-6 -mt-4 text-sm text-gray-500 flex items-center gap-2">
          <FiInfo className="text-gray-400 flex-shrink-0" />
          {imageRefreshMessage}
        </div>
      )}

      {/* Safety Verdict - Priority 1 */}
      <div className={`card border-l-4 border-${safetyColor}-500 mb-6`}>
        <div className="flex items-start gap-4">
          {getSafetyIcon(safetyLevel)}
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">
              Safety Verdict: {safetyLevel}
            </h2>
            {safetyReport?.riskAssessment?.factors && (
              <div className="mt-2">
                <p className="text-sm text-gray-600">Key factors:</p>
                <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                  {safetyReport.riskAssessment.factors.slice(0, 3).map((factor, idx) => (
                    <li key={idx}>{factor.name} - {factor.impact}</li>
                  ))}
                </ul>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">
              ⚠️ This is decision-support information, not medical advice. 
              Always check physical labels for severe allergies.
            </p>
          </div>
        </div>
      </div>

      {/* Key Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <FiActivity className="text-primary-500" />
            <span className="text-sm font-medium">Processing Level</span>
          </div>
          <p className="text-lg font-semibold text-gray-900">
            {product.processingLevel || 'Not classified'}
          </p>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <FiStar className="text-primary-500" />
            <span className="text-sm font-medium">Rating</span>
          </div>
          <p className="text-lg font-semibold text-gray-900">
            {product.averageRating ? `${product.averageRating} / 5` : 'Not rated'}
          </p>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <FiClock className="text-primary-500" />
            <span className="text-sm font-medium">Category</span>
          </div>
          <p className="text-lg font-semibold text-gray-900">
            {product.category || 'Uncategorized'}
          </p>
        </div>
      </div>

      {/* Ingredients */}
      {product.ingredients && product.ingredients.length > 0 && (
        <div className="card mb-6">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <FiFileText className="text-primary-500" />
            Ingredients
          </h3>
          <div className="flex flex-wrap gap-2">
            {product.ingredients.map((ingredient, idx) => (
              <span
                key={idx}
                className={`px-3 py-1 rounded-full text-sm ${
                  safetyReport?.riskAssessment?.factors?.some(f => 
                    f.name.toLowerCase().includes(ingredient.toLowerCase())
                  )
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {ingredient}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* AI Ingredient Explainer */}
      {product.ingredients && product.ingredients.length > 0 && (
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <FiZap className="text-purple-500" />
              What does this actually mean?
            </h3>
            {!explanation && !explainLoading && (
              <button
                onClick={handleExplain}
                className="text-sm font-medium text-purple-600 hover:text-purple-700 flex items-center gap-1"
              >
                <FiZap /> Explain in plain English
              </button>
            )}
          </div>

          {explainLoading && (
            <div className="flex items-center gap-3 py-4 text-gray-500">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-500"></div>
              Asking AI to break this down for {activeProfileName}...
            </div>
          )}

          {explainError && (
            <p className="text-sm text-red-500">{explainError}</p>
          )}

          {explanation && (
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{explanation}</p>
          )}

          {!explanation && !explainLoading && !explainError && (
            <p className="text-sm text-gray-400">
              Get a plain-English explanation of these ingredients, personalized to {activeProfileName}'s allergies, diet, goals, and medications.
            </p>
          )}
        </div>
      )}

      {/* Nutritional Information */}
      {product.nutritionalInfo && (
        <div className="card mb-6">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <FiTrendingUp className="text-primary-500" />
            Nutritional Information
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(product.nutritionalInfo).map(([key, value]) => {
              if (typeof value === 'number' || typeof value === 'string') {
                return (
                  <div key={key}>
                    <p className="text-sm text-gray-500 capitalize">{key}</p>
                    <p className="font-medium text-gray-900">{value}</p>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
      )}

      {/* Safe Swap Alternatives — only worth showing if this product
          isn't already the best option for this user */}
      {safetyLevel !== 'Safe' && alternatives.length > 0 && (
        <div className="card mb-6 border border-green-200">
          <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <FiThumbsUp className="text-green-500" />
            Safer Swaps for You
          </h3>
          <p className="text-sm text-gray-500 mb-3">
            These alternatives were checked against your own allergy and medication profile.
          </p>
          <div className="space-y-3">
            {alternatives.map((alt, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <ProductImage
                    src={alt.images && alt.images.length > 0 ? alt.images[0] : null}
                    alt={alt.name}
                    size={48}
                    rounded="rounded-md"
                  />
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{alt.name}</p>
                    <p className="text-sm text-gray-500 truncate">{alt.brand}</p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{alt.swapReason}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${getSafetyColor(alt.safetyLevel)}-100 text-${getSafetyColor(alt.safetyLevel)}-700`}>
                    {alt.safetyLevel}
                  </span>
                  <button
                    onClick={() => navigate(`/product/${alt.barcode}`)}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium whitespace-nowrap"
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data Source Disclaimer */}
      <div className="text-xs text-gray-400 text-center mt-8">
        <p>Data source: Open Food Facts API</p>
        <p className="mt-1">Information provided is for educational purposes only.</p>
      </div>
    </div>
  );
};

export default Product;