import axios from "axios";

const BASE_URL = "http://localhost:8038/orders"; // Change if needed

// ✅ Random helper
const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// ✅ Some real names for variety
const firstNames = [
  "Ahmad",
  "Mohammad",
  "Ali",
  "Omid",
  "Hussain",
  "Farid",
  "Rahim",
  "Habib",
  "Nasir",
  "Sami",
  "Yasin",
  "Zubair",
  "Bilal",
  "Sajad",
  "Murtaza",
  "Javed",
  "Karim",
  "Mahdi",
  "Reza",
  "Hasib",
  "Wahid",
  "Abdullah",
  "Shafiq",
  "Hamid",
  "Basir",
  "Fazel",
  "Sulaiman",
  "Jawad",
  "Ehsan",
  "Rafi",
  "Masood",
  "Khalid",
];

const lastNames = [
  "Ahmadi",
  "Alizada",
  "Hussaini",
  "Karimi",
  "Rahmani",
  "Sultani",
  "Noori",
  "Azizi",
  "Hosseini",
  "Farooqi",
  "Khatibi",
  "Yousufi",
  "Qadiri",
  "Safdari",
  "Sadat",
  "Nazari",
  "Ahmadzai",
  "Fahimi",
  "Rezayi",
  "Habibi",
  "Jafari",
  "Popal",
  "Sangari",
  "Musavi",
  "Kazemi",
  "Shirzai",
  "Zadran",
  "Latifi",
  "Amini",
  "Haqqani",
];

// ✅ Generate random phone number
const generatePhone = () => `07${random(0, 9)}${random(1000000, 9999999)}`;

// ✅ Generate a single order
const generateOrder = (index) => {
  const digitalCount = random(1, 3);
  const offsetCount = random(1, 2);

  const digital = Array.from({ length: digitalCount }).map((_, i) => ({
    title: `Digital item ${i + 1} (Order ${index})`,
    price: random(100, 500),
  }));

  const offset = Array.from({ length: offsetCount }).map((_, i) => ({
    title: `Offset item ${i + 1} (Order ${index})`,
    price: random(200, 600),
  }));

  const total_money_digital = digital.reduce((s, d) => s + d.price, 0);
  const total_money_offset = offset.reduce((s, d) => s + d.price, 0);
  const total = total_money_digital + total_money_offset;
  const recip = random(0, total);
  const remained = total - recip;

  // ✅ Pick a random name
  const first = firstNames[random(0, firstNames.length - 1)];
  const last = lastNames[random(0, lastNames.length - 1)];

  return {
    customer: {
      name: `${first} ${last}`,
      phone_number: generatePhone(),
    },
    digital,
    offset,
    total_money_digital,
    total_money_offset,
    total,
    recip,
    remained,
  };
};

// ✅ Seed 100 orders
const seedOrders = async () => {
  for (let i = 1; i <= 100; i++) {
    const order = generateOrder(i);
    try {
      await axios.post(BASE_URL, order);
      console.log(`✅ Created order ${i}: ${order.customer.name}`);
    } catch (err) {
      console.error(`❌ Failed to create order ${i}:`, err.message);
    }
  }
  console.log("🌟 Done creating 100 realistic orders!");
};

seedOrders();
