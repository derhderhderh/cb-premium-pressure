import { Booking, STATUS_LABELS } from "./types";
import { toDate } from "./utils";
import { formatBookingServiceDetails, formatBookingServices } from "./booking-services";

const websiteFacts = [
  {
    keywords: ["service", "services", "clean", "pressure", "wash", "washing"],
    answer:
      "CB Premium Pressure offers driveway cleaning, deck cleaning, patio cleaning, sidewalk cleaning, trashcan cleaning, and commercial property cleaning.",
  },
  {
    keywords: ["area", "location", "serve", "allen", "where"],
    answer:
      "CB Premium Pressure serves Allen, Texas and surrounding communities.",
  },
  {
    keywords: ["quote", "price", "pricing", "cost", "estimate"],
    answer:
      "You can get an instant estimate from the booking page by choosing a service and entering the project size. Final pricing is confirmed after inspection.",
  },
  {
    keywords: ["book", "booking", "schedule", "appointment", "available"],
    answer:
      "You can request a service through the booking page. The calendar only allows admin-approved booking days, and the team confirms the final appointment details.",
  },
  {
    keywords: ["text", "call", "confirm", "contact"],
    answer:
      "After a booking request is submitted, a team member texts you directly to confirm details and answer questions.",
  },
  {
    keywords: ["pay", "payment", "due"],
    answer:
      "Payment is due after the service is completed. Final pricing may vary based on condition and accessibility.",
  },
];

const bookingWords = ["status", "booking", "appointment", "request", "job"];

function normalize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9@\s.]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getScore(message: string, keywords: string[]) {
  return keywords.reduce((score, keyword) => {
    return message.includes(keyword) ? score + 1 : score;
  }, 0);
}

export function isBookingStatusQuestion(message: string) {
  const normalized = normalize(message);
  return getScore(normalized, bookingWords) > 0 && normalized.includes("status");
}

export function getSupportAiReply(message: string, matchingBookings: Booking[]) {
  const normalized = normalize(message);

  if (isBookingStatusQuestion(normalized)) {
    if (matchingBookings.length === 0) {
      const includesLookupInfo =
        /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(message) ||
        /(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/.test(message);

      return {
        body: includesLookupInfo
          ? "I could not find a booking matching that email or phone number. I am flagging this for an admin so they can check directly."
          : "I can check booking status if I can match the request. Please send the email address or phone number used for the booking.",
        needsAdmin: true,
      };
    }

    const booking = matchingBookings[0];
    const date = toDate(booking.preferredDate).toLocaleDateString();
    return {
      body: `I found your ${formatBookingServices(booking)} booking request for ${date}. Its current status is ${STATUS_LABELS[booking.status]}. ${formatBookingServiceDetails(booking)} is listed on the request.`,
      needsAdmin: false,
    };
  }

  const bestFact = websiteFacts
    .map((fact) => ({ ...fact, score: getScore(normalized, fact.keywords) }))
    .sort((a, b) => b.score - a.score)[0];

  if (bestFact?.score > 0) {
    return {
      body: bestFact.answer,
      needsAdmin: false,
    };
  }

  return {
    body:
      "I can help with services, service area, estimates, booking basics, and booking status. I am going to flag this for an admin so they can answer directly.",
    needsAdmin: true,
  };
}
