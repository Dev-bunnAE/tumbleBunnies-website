"use client";

import { LoadingSpinner } from "@/components/loading-spinner";
import { StorefrontHeader } from "@/components/storefront-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChildSelectDialog } from "@/components/ui/child-select-dialog";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/hooks/use-toast";
import { Class, db, Facility, Merchandise, useAuth } from "@/lib/firebase";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { Clock, Star, Users } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function FacilityClassesPage() {
  const router = useRouter();
  const params = useParams();
  const facilityId = Array.isArray(params?.facilityId) ? params.facilityId[0] : params?.facilityId;
  const { user, loading: authLoading, getRegistrationAsync } = useAuth();
  const [facility, setFacility] = useState<Facility | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [merchandise, setMerchandise] = useState<Merchandise[]>([]);
  const [loading, setLoading] = useState(true);
  const [registration, setRegistration] = useState<any>(null);
  const { addItem } = useCart();
  const { toast } = useToast();
  
  // Child selection dialog state
  const [childDialogOpen, setChildDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<{cls: Class, session: number, price: number} | null>(null);
  const [classToSessions, setClassToSessions] = useState<{ [classId: string]: number[] }>({});

  useEffect(() => {
    async function fetchData() {
      if (!user || !facilityId) return;
      setLoading(true);
      
      try {
        // Check registration from Firestore
        const registration = await getRegistrationAsync(user.uid);
        if (!registration || registration.facilityId !== facilityId) {
          router.replace("/register");
          return;
        }
        setRegistration(registration);
        
        // Fetch facility
        const facSnap = await getDoc(doc(db, "facilities", facilityId));
        if (!facSnap.exists()) {
          router.replace("/");
          return;
        }
        const facData = { id: facSnap.id, ...facSnap.data() } as Facility;
        setFacility(facData);
        
        // Build a set of valid classIds and a map of classId to valid sessionLengths
        const availablePairs = facData.availablePairs || [];
        const validClassIds = Array.from(new Set(availablePairs.map(p => p.classId)));
        const classToSessions: { [classId: string]: number[] } = {};
        availablePairs.forEach(pair => {
          if (!classToSessions[pair.classId]) classToSessions[pair.classId] = [];
          classToSessions[pair.classId].push(pair.sessionLength);
        });
        setClassToSessions(classToSessions);

        // Fetch classes
        const classSnaps = await Promise.all(
          validClassIds.map((cid) => getDoc(doc(db, "classes", cid)))
        );
        setClasses(
          classSnaps
            .filter((snap) => snap.exists())
            .map((snap) => ({ id: snap.id, ...snap.data() } as Class))
            .sort((a, b) => a.name.localeCompare(b.name))
        );

        // Fetch enabled merchandise
        const merchQuery = query(collection(db, "merchandise"), where("enabled", "==", true));
        const merchSnap = await getDocs(merchQuery);
        setMerchandise(
          merchSnap.docs
            .map((doc) => ({ id: doc.id, ...doc.data() } as Merchandise))
            .sort((a, b) => a.name.localeCompare(b.name))
        );
      } catch (error) {
        console.error("Error fetching data:", error);
        router.replace("/register");
        return;
      } finally {
        setLoading(false);
      }
    }
    
    if (!authLoading) fetchData();
  }, [user, facilityId, authLoading, getRegistrationAsync, router]);

  const handleAddToCart = (cls: Class, session: number, price: number) => {
    if (registration.children.length === 1) {
      // Only one child, add directly
      addItem({
        id: `${cls.id}-${session}`,
        name: `${cls.name} (${session} week${session > 1 ? "s" : ""})`,
        price,
        childName: registration.children[0],
        classId: cls.id,
        sessionLength: session,
      });
      toast({
        title: "Added to Cart",
        description: `${cls.name} (${session} week${session > 1 ? "s" : ""}) added to your cart for ${registration.children[0]}.`,
      });
    } else {
      // Multiple children, show selection dialog
      setSelectedClass({ cls, session, price });
      setChildDialogOpen(true);
    }
  };

  const handleChildSelection = (childName: string) => {
    if (!selectedClass) return;
    
    addItem({
      id: `${selectedClass.cls.id}-${selectedClass.session}`,
      name: `${selectedClass.cls.name} (${selectedClass.session} week${selectedClass.session > 1 ? "s" : ""})`,
      price: selectedClass.price,
      childName,
      classId: selectedClass.cls.id,
      sessionLength: selectedClass.session,
    });
    
    toast({
      title: "Added to Cart",
      description: `${selectedClass.cls.name} (${selectedClass.session} week${selectedClass.session > 1 ? "s" : ""}) added to your cart for ${childName}.`,
    });
  };

  const handleAddMerchandiseToCart = (item: Merchandise) => {
    addItem({
      id: `merch-${item.id}`,
      name: item.name,
      price: item.price,
      childName: '', // Merchandise doesn't need child assignment
      classId: '', // Not a class
      sessionLength: 0, // Not a session
    });
    toast({
      title: "Added to Cart",
      description: `${item.name} added to your cart.`,
    });
  };

  if (loading || authLoading) return <LoadingSpinner fullScreen />;
  if (!facility) return null;

  return (
    <>
      <StorefrontHeader />
      <main className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-headline font-bold text-primary mb-4">
            {facility.name}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover amazing classes for your little ones! Choose from our variety of sessions and find the perfect fit for your family.
          </p>
        </div>

        {/* Classes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {classes.map((cls) => (
            <Card key={cls.id} className="group hover:shadow-xl transition-all duration-300 border-primary/20 hover:border-primary/40 overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-4">
                  {cls.imageUrl && (
                    <div className="relative">
                      <img
                        src={cls.imageUrl}
                        alt={cls.name}
                        className="h-16 w-16 object-cover rounded-full border-2 border-primary/30 group-hover:border-primary/60 transition-colors"
                      />
                      <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                        <Star className="w-3 h-3" />
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>Ages {cls.ageRange}</span>
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold text-primary text-center group-hover:text-primary/80 transition-colors">
                  {cls.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {(classToSessions[cls.id] || []).map((session) => {
                    const price = facility.pricing?.[cls.id]?.[session];
                    if (price == null) return null;
                    return (
                      <div
                        key={session}
                        className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-4 border border-primary/20 hover:border-primary/40 transition-all duration-200"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-primary" />
                            <span className="font-semibold text-primary">
                              {session} week{session > 1 ? "s" : ""}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-primary">
                              ${price.toFixed(2)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              per session
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleAddToCart(cls, session, price)}
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                          size="sm"
                        >
                          Add to Cart
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Merchandise Section */}
        {merchandise.length > 0 && (
          <div className="mt-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-headline font-bold text-primary mb-4">
                TumbleBunnies Merchandise
              </h2>
              <p className="text-lg text-muted-foreground">
                Show your love for TumbleBunnies with our exclusive merchandise!
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {merchandise.map((item) => (
                <Card key={item.id} className="group hover:shadow-xl transition-all duration-300 border-primary/20 hover:border-primary/40 overflow-hidden">
                  <CardHeader className="pb-4">
                    {item.imageUrl && (
                      <div className="relative mb-4">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                    )}
                    <CardTitle className="text-xl font-bold text-primary text-center group-hover:text-primary/80 transition-colors">
                      {item.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      <p className="text-muted-foreground text-center">
                        {item.description}
                      </p>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary mb-3">
                          ${item.price.toFixed(2)}
                        </div>
                        <Button
                          onClick={() => handleAddMerchandiseToCart(item)}
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                          size="sm"
                        >
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Checkout Button Section */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-8 border-2 border-primary/20 hover:border-primary/40 transition-all duration-300">
            <div className="mb-6">
              <h3 className="text-2xl font-headline font-bold text-primary mb-2">
                Ready to Checkout?
              </h3>
              <p className="text-muted-foreground text-lg">
                Review your cart and complete your purchase
              </p>
            </div>
            <Button
              onClick={() => router.push('/checkout')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              size="lg"
            >
              🛒 Go to Checkout
            </Button>
          </div>
        </div>

        {/* Empty State */}
        {classes.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground text-lg">
              No classes available at this time. Please check back later!
            </div>
          </div>
        )}
      </main>

      {/* Child Selection Dialog */}
      {selectedClass && (
        <ChildSelectDialog
          open={childDialogOpen}
          onOpenChange={setChildDialogOpen}
          children={registration.children}
          className={selectedClass.cls.name}
          sessionLength={selectedClass.session}
          price={selectedClass.price}
          onConfirm={handleChildSelection}
        />
      )}
    </>
  );
} 