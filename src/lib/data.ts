import type { Trip } from "./types";

export const CITIES = [
  "Dhaka",
  "Chittagong",
  "Sylhet",
  "Rajshahi",
  "Khulna",
  "Barisal",
  "Rangpur",
  "Mymensingh",
  "Comilla",
  "Gazipur",
];

export const BUS_OPERATORS = [
  "Hanif Enterprize",
  "Green Line",
  "Shohagh Paribahan",
  "Ena Transport",
  "Saintmartin Hyundai",
  "TR Travels",
  "Desh Travels",
  "Soudia Coach",
  "Sakura Paribahan",
  "Unique Service",
  "Shyamoli Paribahan",
  "London Express",
  "Akota Transport",
  "SR Travels",
  "Nabil Paribahan",
  "Royal Coach",
];

export const mockTrips: Trip[] = [
  {
    id: "trip-001",
    origin: "Dhaka",
    destination: "Chittagong",
    departureTime: "2024-09-15T09:00:00",
    arrivalTime: "2024-09-15T15:00:00",
    duration: "6h 00m",
    price: 800.0,
    bus: {
      name: "Hanif Enterprize",
      type: "AC Business Class",
    },
    seatLayout: {
      rows: 10,
      cols: 4,
      aisleCol: 2,
      gapRows: [5],
      booked: ["A1", "B2", "C3", "F4"],
    },
    pickupPoints: [
      { name: "Arambagh", time: "08:30" },
      { name: "Sayedabad", time: "09:00" },
      { name: "Gabtoli", time: "08:00" },
    ]
  },
  {
    id: "trip-002",
    origin: "Dhaka",
    destination: "Chittagong",
    departureTime: "2024-09-15T23:00:00",
    arrivalTime: "2024-09-16T05:00:00",
    duration: "6h 00m",
    price: 1200.0,
    bus: {
      name: "Green Line",
      type: "Sleeper Coach AC",
    },
    seatLayout: {
      rows: 12,
      cols: 4,
      aisleCol: 2,
      gapRows: [],
      booked: ["D1", "D2", "E3", "H1", "J2"],
    },
    pickupPoints: [
      { name: "Arambagh", time: "22:30" },
      { name: "Fokirapool", time: "22:45" },
      { name: "Mohakhali", time: "23:15" },
    ]
  },
  {
    id: "trip-003",
    origin: "Dhaka",
    destination: "Sylhet",
    departureTime: "2024-09-16T07:00:00",
    arrivalTime: "2024-09-16T13:00:00",
    duration: "6h 00m",
    price: 600.0,
    bus: {
      name: "Ena Transport",
      type: "AC Seater",
    },
    seatLayout: {
      rows: 10,
      cols: 3,
      aisleCol: 1,
      gapRows: [4, 8],
      booked: ["A2", "B1", "C2", "C3"],
    },
    pickupPoints: [
        { name: "Mohakhali", time: "07:00" },
        { name: "Uttara", time: "07:30" }
    ]
  },
  {
    id: "trip-004",
    origin: "Chittagong",
    destination: "Dhaka",
    departureTime: "2024-09-17T14:00:00",
    arrivalTime: "2024-09-17T20:00:00",
    duration: "6h 00m",
    price: 850.0,
    bus: {
      name: "Shohagh Paribahan",
      type: "AC Seater",
    },
    seatLayout: {
      rows: 10,
      cols: 4,
      aisleCol: 2,
      gapRows: [5],
      booked: ["A1", "A2", "A3", "A4"],
    },
    pickupPoints: [
        { name: "Dampara", time: "14:00" },
        { name: "Garibullah Shah Mazar Gate", time: "14:15" },
        { name: "AK Khan", time: "14:30" },
    ]
  },
    {
    id: "trip-005",
    origin: "Dhaka",
    destination: "Khulna",
    departureTime: "2024-09-18T22:00:00",
    arrivalTime: "2024-09-19T06:00:00",
    duration: "8h 00m",
    price: 1000.0,
    bus: {
      name: "Sakura Paribahan",
      type: "Non-AC",
    },
    seatLayout: {
      rows: 10,
      cols: 4,
      aisleCol: 2,
      gapRows: [5],
      booked: ["B3", "C1", "D4"],
    },
    pickupPoints: [
        { name: "Gabtoli", time: "22:00" },
        { name: "Kallyanpur", time: "22:15" }
    ]
  },
  {
    id: "trip-006",
    origin: "Dhaka",
    destination: "Chittagong",
    departureTime: "2024-09-15T06:30:00",
    arrivalTime: "2024-09-15T12:30:00",
    duration: "6h 00m",
    price: 650.0,
    bus: {
      name: "Soudia Coach",
      type: "Non-AC",
    },
    seatLayout: {
      rows: 10,
      cols: 4,
      aisleCol: 2,
      gapRows: [5],
      booked: ["G1", "G2"],
    },
    pickupPoints: [
      { name: "Gabtoli", time: "05:30" },
      { name: "Sayedabad", time: "06:30" },
    ]
  },
  {
    id: "trip-007",
    origin: "Dhaka",
    destination: "Chittagong",
    departureTime: "2024-09-15T13:00:00",
    arrivalTime: "2024-09-15T19:00:00",
    duration: "6h 00m",
    price: 900.0,
    bus: {
      name: "TR Travels",
      type: "AC Seater",
    },
    seatLayout: {
      rows: 10,
      cols: 4,
      aisleCol: 2,
      gapRows: [5],
      booked: ["B1", "B2", "C1", "C2", "C3", "C4", "E1", "E2", "F3", "F4"],
    },
    pickupPoints: [
      { name: "Kallyanpur", time: "12:30" },
      { name: "Mohakhali", time: "13:00" },
    ]
  },
  {
    id: "trip-008",
    origin: "Dhaka",
    destination: "Chittagong",
    departureTime: "2024-09-15T18:30:00",
    arrivalTime: "2024-09-16T00:30:00",
    duration: "6h 00m",
    price: 750.0,
    bus: {
      name: "Desh Travels",
      type: "Non-AC",
    },
    seatLayout: {
      rows: 10,
      cols: 4,
      aisleCol: 2,
      gapRows: [5],
      booked: ["A2", "A3", "B1"],
    },
    pickupPoints: [
      { name: "Sayedabad", time: "18:30" },
    ]
  },
  {
    id: "trip-009",
    origin: "Dhaka",
    destination: "Chittagong",
    departureTime: "2024-09-15T21:00:00",
    arrivalTime: "2024-09-16T03:00:00",
    duration: "6h 00m",
    price: 1500.0,
    bus: {
      name: "Saintmartin Hyundai",
      type: "AC Business Class",
    },
    seatLayout: {
      rows: 10,
      cols: 4,
      aisleCol: 2,
      gapRows: [5],
      booked: ["A1", "A2", "B1", "B2", "C1", "C2", "D1", "D2"],
    },
    pickupPoints: [
      { name: "Arambagh", time: "20:30" },
      { name: "Fokirapool", time: "20:45" },
    ]
  },
  {
    id: "trip-010",
    origin: "Dhaka",
    destination: "Chittagong",
    departureTime: "2024-09-15T02:00:00",
    arrivalTime: "2024-09-15T08:00:00",
    duration: "6h 00m",
    price: 550.0,
    bus: {
      name: "Unique Service",
      type: "Non-AC",
    },
    seatLayout: {
      rows: 10,
      cols: 4,
      aisleCol: 2,
      gapRows: [5],
      booked: ["H1", "H2", "H3", "H4", "I1", "I2"],
    },
    pickupPoints: [
      { name: "Gabtoli", time: "01:30" },
      { name: "Sayedabad", time: "02:00" },
    ]
  }
];

export const getTripById = (id: string): Trip | undefined => {
  return mockTrips.find((trip) => trip.id === id);
};

export const findTrips = (origin: string, destination: string, date: string) => {
  // In a real app, you'd filter by date as well.
  // For this mock, we'll return trips that match origin and destination.
  const trips = mockTrips.filter(
    (trip) =>
      trip.origin.toLowerCase() === origin.toLowerCase() &&
      trip.destination.toLowerCase() === destination.toLowerCase()
  );

  // Add a fake delay to simulate network latency
  return new Promise<Trip[]>((resolve) => {
    setTimeout(() => {
        resolve(trips);
    }, 1500)
  })
};

export const getBookingById = (id: string) => {
    // This is a mock function. In a real app, you'd fetch this from a database.
    const trip = getTripById('trip-001');
    if (!trip) return undefined;
    
    const booking = {
        id: id,
        trip: trip,
        passengers: [{ name: 'John Doe', mobile: '01700000000' }],
        seats: ['D3', 'D4'],
        pickupPoint: "Gabtoli",
        totalPrice: 70,
        bookingDate: new Date().toISOString(),
    };
    return booking;
}

    