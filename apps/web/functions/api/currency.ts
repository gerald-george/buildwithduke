const euroCountries = new Set([
  "AD", "AT", "BE", "BL", "CY", "DE", "EE", "ES", "FI", "FR", "GF", "GP", "GR", "HR", "IE", "IT",
  "LT", "LU", "LV", "MC", "ME", "MF", "MQ", "MT", "NL", "PM", "PT", "RE", "SI", "SK", "SM", "VA", "XK", "YT",
]);

const dollarCountries = new Set([
  "AS", "BQ", "EC", "FM", "GU", "MH", "MP", "PA", "PR", "PW", "SV", "TC", "TL", "US", "UM", "VG", "VI",
]);

export const onRequestGet: PagesFunction = async ({ request }) => {
  const country = request.cf?.country;
  const currency = country && euroCountries.has(country) ? "EUR" : country && dollarCountries.has(country) ? "USD" : "GBP";
  return Response.json({ currency }, { headers: { "Cache-Control": "private, no-store", "Vary": "CF-IPCountry" } });
};
