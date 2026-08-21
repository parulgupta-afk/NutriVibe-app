import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiCamera,
  FiAlertCircle,
  FiCheckCircle,
  FiInfo,
  FiX,
  FiImage,
  FiLoader,
  FiEdit3,
} from "react-icons/fi";
import { productApi } from "../api/products";
import { useProfile } from "../contexts/ProfileContext";
import ProfileSelector from "../components/common/ProfileSelector";
import { saveLastScan, loadLastScan } from "../utils/lastScanCache";

const CAMERA_REGION_ID = "barcode-camera-region";

const Scanner = () => {
  const { activeProfileId } = useProfile();
  const [barcode, setBarcode] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  // --- Live camera barcode scanning state ---
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStarting, setCameraStarting] = useState(false);
  const html5QrRef = useRef(null);

  // --- OCR label-scanning state ---
  const [ocrMode, setOcrMode] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrRunning, setOcrRunning] = useState(false);
  const [ocrText, setOcrText] = useState("");
  const [ocrImagePreview, setOcrImagePreview] = useState(null);
  const [ocrProductName, setOcrProductName] = useState("");
  const [submittingLabel, setSubmittingLabel] = useState(false);
  const [lastScan, setLastScan] = useState(() => loadLastScan());
  const fileInputRef = useRef(null);

  // Always stop the camera if the component unmounts while it's running
  useEffect(() => {
    return () => {
      if (html5QrRef.current) {
        html5QrRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const handleScan = async (overrideCode) => {
    const codeToScan = (overrideCode || barcode).trim();

    if (!codeToScan) {
      setError("Please enter or scan a barcode");
      return;
    }

    setScanning(true);
    setError(null);
    setResult(null);

    try {
      const product = await productApi.searchByBarcode(
        codeToScan,
        activeProfileId,
      );
      setResult(product);
      const data = product?.data || product;
      const scanMeta = {
        barcode: codeToScan,
        name: data?.name,
        brand: data?.brand,
        safetyLevel: product?.safetyReport?.riskAssessment?.level,
      };
      saveLastScan(scanMeta);
      setLastScan(scanMeta);
      // Navigate to product details after a short delay
      setTimeout(() => {
        navigate(`/product/${codeToScan}`);
      }, 1200);
    } catch (err) {
      const apiMsg = err.response?.data?.message;
      const reason = err.response?.data?.reason;
      if (apiMsg) {
        setError(apiMsg);
      } else if (!err.response) {
        setError(
          "Cannot reach the server. Is the backend running on port 5000?",
        );
      } else {
        setError(
          "Product not found. Try another barcode or scan the ingredient label instead.",
        );
      }
      console.error("Scan error:", reason || err.message || err);
    } finally {
      setScanning(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleScan();
    }
  };

  const stopCamera = async () => {
    if (html5QrRef.current) {
      try {
        await html5QrRef.current.stop();
        html5QrRef.current.clear();
      } catch (err) {
        // Camera may already be stopped — safe to ignore
      }
      html5QrRef.current = null;
    }
    setCameraActive(false);
    setCameraStarting(false);
  };

  const startCamera = async () => {
    setError(null);
    setCameraActive(true);
    setCameraStarting(true);

    try {
      // Loaded dynamically so it doesn't bloat the initial bundle for
      // users who never use camera scanning
      const { Html5Qrcode, Html5QrcodeSupportedFormats } =
        await import("html5-qrcode");

      // Give the DOM a tick to render the camera container div first
      await new Promise((resolve) => setTimeout(resolve, 50));

      const html5Qr = new Html5Qrcode(CAMERA_REGION_ID, {
        // Explicitly list every format real retail barcodes actually
        // use, so scanning isn't silently limited to QR codes only.
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.CODABAR,
          Html5QrcodeSupportedFormats.ITF,
          Html5QrcodeSupportedFormats.QR_CODE,
        ],
        verbose: false,
      });
      html5QrRef.current = html5Qr;

      await html5Qr.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 280, height: 160 },
        },
        (decodedText) => {
          // Successful decode — stop the camera and submit immediately
          setBarcode(decodedText);
          stopCamera();
          handleScan(decodedText);
        },
        () => {
          // Per-frame "nothing detected yet" callback — expected on
          // almost every frame, intentionally not treated as an error
        },
      );

      setCameraStarting(false);
    } catch (err) {
      console.error("Camera start error:", err);
      setError(
        "Could not access the camera. Check that you've granted camera permission, or enter the barcode manually below.",
      );
      setCameraActive(false);
      setCameraStarting(false);
      html5QrRef.current = null;
    }
  };

  const handleImageSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrImagePreview(URL.createObjectURL(file));
    setOcrText("");
    setOcrRunning(true);
    setOcrProgress(0);
    setError(null);

    try {
      // Loaded dynamically so it doesn't bloat the initial bundle for
      // users who never use this feature
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker("eng", 1, {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setOcrProgress(Math.round(m.progress * 100));
          }
        },
      });

      const { data } = await worker.recognize(file);
      setOcrText(data.text.trim());
      await worker.terminate();
    } catch (err) {
      console.error("OCR error:", err);
      setError(
        "Could not read text from that image. Try a clearer, well-lit photo of the ingredients list.",
      );
    } finally {
      setOcrRunning(false);
    }
  };

  const handleSubmitLabel = async () => {
    if (!ocrText.trim()) {
      setError("No ingredient text to analyze yet.");
      return;
    }

    setSubmittingLabel(true);
    setError(null);
    try {
      const response = await productApi.scanLabel(
        ocrText,
        ocrProductName,
        activeProfileId,
      );
      navigate(`/product/${response.data.barcode}`);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Failed to analyze this label. Please try again.";
      setError(message);
      console.error("Label scan error:", err);
    } finally {
      setSubmittingLabel(false);
    }
  };

  const resetOcr = () => {
    setOcrText("");
    setOcrImagePreview(null);
    setOcrProductName("");
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const switchMode = (toOcrMode) => {
    stopCamera();
    setOcrMode(toOcrMode);
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Scan a Product
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Point your camera at a barcode to get instant safety and nutrition
          information
        </p>
        <div className="mt-4 flex justify-center">
          <ProfileSelector />
        </div>
        {lastScan?.barcode && (
          <div className="mt-4 max-w-md mx-auto text-left p-3 rounded-lg border border-primary-100 bg-primary-50/50">
            <p className="text-xs text-gray-400 dark:text-gray-200 mb-1">
              Last scan on this device
            </p>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {lastScan.name || lastScan.barcode}
              {lastScan.brand ? (
                <span className="text-gray-500 dark:text-gray-200 font-normal">
                  {" "}
                  · {lastScan.brand}
                </span>
              ) : null}
            </p>
            <button
              type="button"
              className="mt-2 text-sm text-primary-700 hover:text-primary-800 font-medium"
              onClick={() => navigate(`/product/${lastScan.barcode}`)}
            >
              Open again →
            </button>
          </div>
        )}
      </div>

      <div className="card max-w-2xl mx-auto">
        {/* Mode Toggle */}
        <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-lg">
          <button
            onClick={() => switchMode(false)}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
              !ocrMode
                ? "bg-white shadow text-gray-900 dark:bg-gray-700 dark:text-gray-100"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            Barcode
          </button>
          <button
            onClick={() => switchMode(true)}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
              ocrMode
                ? "bg-white shadow text-gray-900 dark:bg-gray-700 dark:text-gray-100"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            Scan Label Instead
          </button>
        </div>

        {!ocrMode ? (
          <>
            {/* Live camera scanner */}
            {cameraActive ? (
              <div className="mb-4">
                <div className="relative rounded-lg overflow-hidden bg-black">
                  <div id={CAMERA_REGION_ID} style={{ width: "100%" }} />

                  {!cameraStarting && (
                    <div
                      className="absolute pointer-events-none"
                      style={{
                        top: "50%",
                        left: "50%",
                        width: "280px",
                        height: "160px",
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      {/* Corner brackets */}
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-400 rounded-tl-md" />
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-400 rounded-tr-md" />
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-400 rounded-bl-md" />
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-400 rounded-br-md" />

                      {/* Animated scan line */}
                      <div className="scan-line absolute left-0 right-0 h-0.5 bg-green-400 shadow-[0_0_8px_2px_rgba(74,222,128,0.8)]" />
                    </div>
                  )}

                  {cameraStarting && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white text-sm gap-2">
                      <FiLoader className="animate-spin" /> Starting camera...
                    </div>
                  )}
                </div>
                <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Align the barcode within the green frame
                </p>
                <button
                  onClick={stopCamera}
                  className="mt-3 w-full flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-lg py-2"
                >
                  <FiX /> Cancel camera scan
                </button>
              </div>
            ) : (
              <button
                onClick={startCamera}
                className="btn-primary w-full flex items-center justify-center gap-2 mb-4"
              >
                <FiCamera /> Scan with Camera
              </button>
            )}

            {/* Manual entry fallback */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                <FiEdit3 /> or enter manually
              </span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter barcode number..."
                  className="input-field"
                />
              </div>
              <button
                onClick={() => handleScan()}
                disabled={scanning}
                className="btn-secondary flex items-center gap-2 whitespace-nowrap"
              >
                {scanning ? "Scanning..." : "Scan"}
              </button>
            </div>

            {/* Demo Barcodes */}
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Try these:
              </span>
              {["1234567890123", "9876543210987", "4567890123456"].map(
                (code) => (
                  <button
                    key={code}
                    onClick={() => {
                      setBarcode(code);
                      inputRef.current?.focus();
                    }}
                    className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 transition-colors"
                  >
                    {code}
                  </button>
                ),
              )}
            </div>

            {/* Scanning Result */}
            {scanning && (
              <div className="mt-6 flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-300">
                  Analyzing product...
                </span>
              </div>
            )}

            {result && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                <FiCheckCircle className="text-green-500 text-xl mt-0.5" />
                <div>
                  <p className="font-medium text-green-700">Product Found!</p>
                  <p className="text-green-600 text-sm">
                    Redirecting to product details...
                  </p>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {/* OCR Label Scanning */}
            {!ocrImagePreview ? (
              <div className="text-center py-6">
                <FiImage className="text-4xl text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Take a clear, well-lit photo of the ingredients list on the
                  package.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageSelected}
                  className="hidden"
                  id="label-file-input"
                />
                <label
                  htmlFor="label-file-input"
                  className="btn-primary inline-flex items-center gap-2 cursor-pointer"
                >
                  <FiCamera /> Take or Upload Photo
                </label>
              </div>
            ) : (
              <div>
                <div className="flex items-start gap-4 mb-4">
                  <img
                    src={ocrImagePreview}
                    alt="Label preview"
                    className="w-24 h-24 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                  />
                  <div className="flex-1">
                    <button
                      onClick={resetOcr}
                      className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-1"
                    >
                      <FiX /> Retake photo
                    </button>
                  </div>
                </div>

                {ocrRunning ? (
                  <div className="flex items-center gap-3 py-6 justify-center text-gray-600 dark:text-gray-300">
                    <FiLoader className="animate-spin" />
                    Reading label... {ocrProgress > 0 ? `${ocrProgress}%` : ""}
                  </div>
                ) : (
                  <>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                      Product name (optional)
                    </label>
                    <input
                      type="text"
                      value={ocrProductName}
                      onChange={(e) => setOcrProductName(e.target.value)}
                      placeholder="e.g. Homemade Granola Bars"
                      className="input-field mb-4"
                    />

                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                      Extracted ingredients — review and correct any OCR
                      mistakes
                    </label>
                    <textarea
                      value={ocrText}
                      onChange={(e) => setOcrText(e.target.value)}
                      rows={6}
                      className="input-field font-mono text-sm"
                      placeholder="Ingredients will appear here after scanning..."
                    />

                    <button
                      onClick={handleSubmitLabel}
                      disabled={submittingLabel || !ocrText.trim()}
                      className="btn-primary w-full mt-4 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {submittingLabel ? "Analyzing..." : "Analyze Ingredients"}
                    </button>
                  </>
                )}
              </div>
            )}
          </>
        )}

        {/* Error Message (shared between both modes) */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <FiAlertCircle className="text-red-500 text-xl mt-0.5" />
            <div>
              <p className="font-medium text-red-700">Error</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
            <FiInfo className="text-primary-500 text-xl mt-0.5" />
            <div>
              <p className="font-medium text-gray-700 dark:text-gray-200">
                How it works:
              </p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                {!ocrMode ? (
                  <>
                    <li>
                      Tap "Scan with Camera" and point at a real barcode, or
                      type one in manually
                    </li>
                    <li>We check ingredients against your allergen profile</li>
                    <li>
                      Get instant safety verdict and personalized insights
                    </li>
                  </>
                ) : (
                  <>
                    <li>Photograph the ingredients list on any package</li>
                    <li>
                      We extract the text and let you correct any mistakes
                    </li>
                    <li>
                      Get the same personalized safety verdict as a barcode scan
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scanner;
