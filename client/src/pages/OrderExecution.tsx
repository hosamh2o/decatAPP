import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation, useParams } from "wouter";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Camera, X, Check, Loader2 } from "lucide-react";
import { BarcodeScanner } from "@/components/BarcodeScanner";
import { toast } from "sonner";

interface ExecutionBike {
  id: number;
  name: string;
  quantity: number;
  scannedBarcodes: string[];
}

export default function OrderExecution() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const { id } = useParams();

  const [bikes, setBikes] = useState<ExecutionBike[]>([]);
  const [showScanner, setShowScanner] = useState(false);
  const [currentScanningBikeIndex, setCurrentScanningBikeIndex] = useState<number | null>(null);
  const [manualBarcode, setManualBarcode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== "mechanic")) {
      setLocation("/");
    }

    // TODO: Fetch order details from API
    // Mock data for now
    setBikes([
      { id: 1, name: "Vélo Enfant", quantity: 2, scannedBarcodes: [] },
      { id: 2, name: "Vélo Route", quantity: 1, scannedBarcodes: [] },
    ]);
  }, [user, loading, setLocation]);

  const handleStartScanning = (index: number) => {
    setCurrentScanningBikeIndex(index);
    setShowScanner(true);
  };

  const handleBarcodeScan = (barcode: string) => {
    if (currentScanningBikeIndex === null) return;

    const updatedBikes = [...bikes];
    const currentBike = updatedBikes[currentScanningBikeIndex];

    if (currentBike.scannedBarcodes.includes(barcode)) {
      toast.error("Duplicate barcode");
      return;
    }

    if (currentBike.scannedBarcodes.length >= currentBike.quantity) {
      toast.error("All bikes scanned");
      return;
    }

    currentBike.scannedBarcodes.push(barcode);
    setBikes(updatedBikes);
    toast.success(`Scanned (${currentBike.scannedBarcodes.length}/${currentBike.quantity})`);

    if (currentBike.scannedBarcodes.length === currentBike.quantity) {
      setShowScanner(false);
      setCurrentScanningBikeIndex(null);
    }
  };

  const handleManualBarcode = () => {
    if (!manualBarcode.trim()) {
      toast.error("Enter barcode");
      return;
    }
    handleBarcodeScan(manualBarcode);
    setManualBarcode("");
  };

  const handleRemoveBarcode = (bikeIndex: number, barcodeIndex: number) => {
    const updatedBikes = [...bikes];
    updatedBikes[bikeIndex].scannedBarcodes.splice(barcodeIndex, 1);
    setBikes(updatedBikes);
  };

  const handleCompleteOrder = async () => {
    const incompleteBikes = bikes.filter(
      (bike) => bike.scannedBarcodes.length < bike.quantity
    );

    if (incompleteBikes.length > 0) {
      toast.error("Scan all bikes");
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Call API to mark order as complete
      toast.success("Order completed");
      setLocation("/mechanic/dashboard");
    } catch (error) {
      toast.error("Error completing order");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !user) return null;

  const getTotalBikes = () => bikes.reduce((sum, bike) => sum + bike.quantity, 0);
  const getTotalScanned = () =>
    bikes.reduce((sum, bike) => sum + bike.scannedBarcodes.length, 0);
  const isAllComplete = getTotalScanned() === getTotalBikes() && getTotalBikes() > 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setLocation("/mechanic/dashboard")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Execute Order #{id}</h1>
        </div>

        {getTotalBikes() > 0 && (
          <Card className="border-cyan-200 bg-cyan-50/50">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">Progress</span>
                  <span className="text-cyan-600 font-semibold">
                    {getTotalScanned()}/{getTotalBikes()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      isAllComplete ? "bg-green-500" : "bg-cyan-500"
                    }`}
                    style={{ width: `${(getTotalScanned() / getTotalBikes()) * 100}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-cyan-200">
          <CardHeader>
            <CardTitle>Bikes to Assemble</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {bikes.map((bike, index) => {
              const isComplete = bike.scannedBarcodes.length === bike.quantity;

              return (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{bike.name}</p>
                      <p className="text-sm text-gray-600">Quantity: {bike.quantity}</p>
                    </div>
                    {isComplete && (
                      <div className="flex items-center gap-1 text-green-600 font-semibold">
                        <Check className="w-4 h-4" /> Done
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Barcodes</span>
                      <span className="font-semibold text-cyan-600">
                        {bike.scannedBarcodes.length}/{bike.quantity}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all ${
                          isComplete ? "bg-green-500" : "bg-cyan-500"
                        }`}
                        style={{ width: `${(bike.scannedBarcodes.length / bike.quantity) * 100}%` }}
                      />
                    </div>
                  </div>

                  {bike.scannedBarcodes.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-700">Scanned:</p>
                      <div className="flex flex-wrap gap-2">
                        {bike.scannedBarcodes.map((barcode, barcodeIndex) => (
                          <div
                            key={barcodeIndex}
                            className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-1"
                          >
                            <code className="text-xs font-mono text-green-700">{barcode}</code>
                            <button
                              onClick={() => handleRemoveBarcode(index, barcodeIndex)}
                              className="text-green-600 hover:text-red-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!isComplete && (
                    <Button
                      onClick={() => handleStartScanning(index)}
                      variant="outline"
                      className="w-full border-cyan-300 text-cyan-600 hover:bg-cyan-50"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Scan ({bike.scannedBarcodes.length}/{bike.quantity})
                    </Button>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button
            onClick={() => setLocation("/mechanic/dashboard")}
            variant="outline"
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCompleteOrder}
            disabled={!isAllComplete || isSubmitting}
            className="flex-1 bg-green-500 hover:bg-green-600"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Check className="w-4 h-4 mr-2" />
            )}
            Complete Order
          </Button>
        </div>

        {showScanner && currentScanningBikeIndex !== null && (
          <BarcodeScanner
            onScan={handleBarcodeScan}
            onClose={() => {
              setShowScanner(false);
              setCurrentScanningBikeIndex(null);
            }}
          />
        )}

        {showScanner && currentScanningBikeIndex !== null && (
          <div className="fixed inset-0 z-40 bg-black/50 flex items-center justify-center">
            <Card className="w-full max-w-sm mx-4 border-cyan-200">
              <CardHeader>
                <CardTitle className="text-lg">Manual Barcode</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Enter barcode manually:
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Barcode..."
                    value={manualBarcode}
                    onChange={(e) => setManualBarcode(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") handleManualBarcode();
                    }}
                    autoFocus
                  />
                  <Button
                    onClick={handleManualBarcode}
                    className="bg-cyan-500 hover:bg-cyan-600"
                  >
                    Add
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
