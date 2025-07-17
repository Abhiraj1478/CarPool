// Carpool App with Live Google Maps – Verified + Responsive

import { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  updateDoc,
  doc
} from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BadgeCheck } from 'lucide-react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const mapContainerStyle = {
  width: '100%',
  height: '200px',
};

export default function CarpoolApp() {
  const [rideHistory, setRideHistory] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [mapLoaded, setMapLoaded] = useState(false);

  const fetchHistory = async () => {
    const snapshot = await getDocs(collection(db, "rideRequests"));
    const completed = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(r => r.status === "completed");
    setRideHistory(completed);
  };

  const rateRide = async (rideId) => {
    const ref = doc(db, "rideRequests", rideId);
    await updateDoc(ref, { rating, comment });
    setRating(0);
    setComment("");
    alert("Thanks for rating the ride.");
    fetchHistory();
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="p-4 max-w-lg mx-auto sm:px-6 md:px-8">
      <h2 className="text-xl font-bold mb-4 text-center">Ride History & Live Tracking</h2>
      {rideHistory.length === 0 ? (
        <p className="text-center text-gray-600">No completed rides yet.</p>
      ) : (
        rideHistory.map(ride => (
          <Card key={ride.id} className="mb-4 rounded-2xl shadow-md">
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">From: {ride.from}</p>
                  <p className="text-sm font-medium">To: {ride.to}</p>
                </div>
                {ride.driverVerified && (
                  <div className="flex items-center text-green-600">
                    <BadgeCheck className="w-4 h-4 mr-1" />
                    <span className="text-xs">Verified Driver</span>
                  </div>
                )}
              </div>
              <p className="text-sm"><strong>Fare:</strong> ₹{ride.fare}</p>
              {ride.latitude && ride.longitude && (
                <LoadScript
                  googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY"
                  onLoad={() => setMapLoaded(true)}
                >
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={{ lat: ride.latitude, lng: ride.longitude }}
                    zoom={14}
                  >
                    <Marker position={{ lat: ride.latitude, lng: ride.longitude }} />
                  </GoogleMap>
                </LoadScript>
              )}
              {ride.rating ? (
                <p className="text-green-600 text-sm">Rated: ⭐ {ride.rating} – {ride.comment}</p>
              ) : (
                <div className="mt-2">
                  <p className="mb-1 text-sm">Rate this ride:</p>
                  <Select value={String(rating)} onValueChange={val => setRating(Number(val))}>
                    <SelectTrigger className="w-full text-sm">
                      <SelectValue placeholder="Rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">⭐ 1</SelectItem>
                      <SelectItem value="2">⭐ 2</SelectItem>
                      <SelectItem value="3">⭐ 3</SelectItem>
                      <SelectItem value="4">⭐ 4</SelectItem>
                      <SelectItem value="5">⭐ 5</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Leave a comment"
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    className="my-2 text-sm"
                  />
                  <Button className="w-full" onClick={() => rateRide(ride.id)}>
                    Submit Rating
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
