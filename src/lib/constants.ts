const GA4_MEASUREMENT_ID_PATTERN = /^G-[A-Z0-9]+$/i;

export const validateGaMeasurementId = (value: string | undefined | null) => {
  if (!value) {
    return null;
  }

  return GA4_MEASUREMENT_ID_PATTERN.test(value) ? value : null;
};
