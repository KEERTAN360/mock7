"use client"

import {
  Star,
  MapPin,
  Wifi,
  Car,
  Coffee,
  Utensils,
  Dumbbell,
  Building as Swimming,
  Share2,
  Calendar,
  CreditCard,
  Train,
  Plane,
  Navigation,
  CheckCircle,
  XCircle,
  Home,
  FileText,
  AlertTriangle,
  Menu,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter, useParams } from "next/navigation"
import { useState } from "react"
import LikeButton from "@/components/like-button"

export default function HotelDetailPage() {
  const router = useRouter()
  const params = useParams()
  const hotelName = decodeURIComponent(params.name as string)
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null)

  // Mock hotel data - in real app this would come from API
  const hotelData = {
    name: hotelName || "ITC Gardenia",
    image: "/luxury-hotel-exterior.jpg",
    rating: 4.8,
    reviews: 2847,
    location: "UB City Mall, Vittal Mallya Road, Bangalore",
    price: "₹12,500",
    originalPrice: "₹15,000",
    amenities: [
      { icon: Wifi, label: "Free WiFi" },
      { icon: Car, label: "Parking" },
      { icon: Coffee, label: "Coffee Shop" },
      { icon: Utensils, label: "Restaurant" },
      { icon: Dumbbell, label: "Fitness Center" },
      { icon: Swimming, label: "Swimming Pool" },
    ],
  }

  const roomTypes = [
    { type: "Deluxe Room", price: "₹12,500", originalPrice: "₹15,000", size: "35 sqm" },
    { type: "Executive Suite", price: "₹18,500", originalPrice: "₹22,000", size: "55 sqm" },
    { type: "Presidential Suite", price: "₹35,000", originalPrice: "₹42,000", size: "120 sqm" },
  ]

  const reviews = [
    {
      name: "Rajesh Kumar",
      rating: 5,
      comment: "Excellent service and beautiful rooms. The staff was very helpful.",
      date: "2 days ago",
    },
    {
      name: "Priya Sharma",
      rating: 4,
      comment: "Great location and amenities. Breakfast was amazing!",
      date: "1 week ago",
    },
    {
      name: "Michael Johnson",
      rating: 5,
      comment: "Perfect for business trips. Very professional service.",
      date: "2 weeks ago",
    },
  ]

  const travelOptions = [
    { mode: "Auto", icon: Navigation, time: "25 min", price: "₹180", distance: "8.5 km" },
    { mode: "Taxi", icon: Car, time: "20 min", price: "₹320", distance: "8.5 km" },
    { mode: "Metro", icon: Train, time: "35 min", price: "₹45", distance: "9.2 km" },
    { mode: "Flight", icon: Plane, time: "45 min", price: "₹150", distance: "Airport" },
  ]

  const dos = [
    "Carry valid ID proof for check-in",
    "Respect hotel policies and timings",
    "Use hotel amenities responsibly",
    "Keep your room key safe",
    "Follow dress code in restaurants",
  ]

  const donts = [
    "Don't smoke in non-smoking areas",
    "Don't bring outside food to restaurants",
    "Don't make excessive noise after 10 PM",
    "Don't damage hotel property",
    "Don't leave valuables unattended",
  ]

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 pt-6">
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-gray-800 text-center">Hotel Details</h1>
        </div>
        <Button variant="ghost" size="icon" className="text-gray-600">
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 pb-20">
        {/* Hotel Image */}
        <div className="relative h-64 overflow-hidden">
          <img
            src={hotelData.image || "/placeholder.svg?height=300&width=400&query=luxury hotel exterior"}
            alt={hotelData.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 right-4 flex gap-2">
            <LikeButton
              placeId={hotelData.name.toLowerCase().replace(/\s+/g, "-")}
              placeName={hotelData.name}
              placeData={{
                name: hotelData.name,
                location: hotelData.location,
                image: hotelData.image,
                rating: hotelData.rating.toString(),
                timing: "24 Hours",
                entry: hotelData.price,
                description: "Luxury hotel with excellent amenities",
              }}
              className="shadow-lg"
            />
            <Button size="icon" variant="secondary" className="rounded-full bg-white/80">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="px-4">
          {/* Hotel Info */}
          <div className="py-4 border-b border-gray-100">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{hotelData.name}</h1>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{hotelData.rating}</span>
              </div>
              <span className="text-gray-500">({hotelData.reviews} reviews)</span>
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">{hotelData.location}</span>
            </div>
          </div>

          {/* Amenities */}
          <div className="py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-3">Amenities</h3>
            <div className="grid grid-cols-3 gap-3">
              {hotelData.amenities.map((amenity, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <amenity.icon className="h-4 w-4 text-blue-600" />
                  <span className="text-xs text-gray-700">{amenity.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Booking Options */}
          <div className="py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-3">Booking Options</h3>
            <div className="space-y-3">
              {roomTypes.map((room, index) => (
                <Card
                  key={index}
                  className={`p-4 cursor-pointer transition-all ${
                    selectedRoom === room.type ? "ring-2 ring-blue-500 bg-blue-50" : "hover:shadow-md"
                  }`}
                  onClick={() => setSelectedRoom(room.type)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-gray-800">{room.type}</h4>
                      <p className="text-sm text-gray-600">{room.size}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-green-600">{room.price}</span>
                        <span className="text-sm text-gray-500 line-through">{room.originalPrice}</span>
                      </div>
                      <Button size="sm" className="mt-2">
                        <Calendar className="h-4 w-4 mr-1" />
                        Book Now
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div className="py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-3">Reviews</h3>
            <div className="space-y-4">
              {reviews.map((review, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium text-gray-800">{review.name}</h4>
                      <div className="flex items-center gap-1">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">{review.date}</span>
                  </div>
                  <p className="text-sm text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Travel Options */}
          <div className="py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-3">Travel Options</h3>
            <div className="grid grid-cols-2 gap-3">
              {travelOptions.map((option, index) => (
                <Card
                  key={index}
                  className="p-3 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() =>
                    router.push(
                      `/travel?mode=${option.mode.toLowerCase()}&destination=${encodeURIComponent(hotelData.name)}&price=${option.price}&time=${option.time}&distance=${option.distance}`,
                    )
                  }
                >
                  <div className="flex items-center gap-2 mb-2">
                    <option.icon className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-gray-800">{option.mode}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>
                      {option.time} • {option.distance}
                    </p>
                    <p className="font-medium text-green-600">{option.price}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Do's and Don'ts */}
          <div className="py-4">
            <h3 className="font-semibold text-gray-800 mb-3">Do's & Don'ts</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <h4 className="font-medium text-green-600 mb-2 flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  Do's
                </h4>
                <ul className="space-y-1">
                  {dos.map((item, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-red-600 mb-2 flex items-center gap-1">
                  <XCircle className="h-4 w-4" />
                  Don'ts
                </h4>
                <ul className="space-y-1">
                  {donts.map((item, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                      <XCircle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around items-center">
          {[
            { icon: Home, label: "Home", href: "/" },
            { icon: MapPin, label: "Tourist Spots", href: "/tourist-spots" },
            { icon: CreditCard, label: "Pay", href: "/pay" },
            { icon: FileText, label: "Documents", href: "/documents" },
            { icon: AlertTriangle, label: "SOS", href: "/sos" },
          ].map((item, index) => (
            <Button
              key={item.label}
              variant="ghost"
              onClick={() => item.href && router.push(item.href)}
              className="flex flex-col items-center gap-1 p-2 h-auto text-gray-600 hover:text-gray-800 hover:bg-gray-100"
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs text-gray-600">{item.label}</span>
            </Button>
          ))}
        </div>

        <div className="text-center mt-2 pb-2">
          <p className="text-xs text-gray-400">Made in Bangalore, India</p>
        </div>
      </div>
    </div>
  )
}
