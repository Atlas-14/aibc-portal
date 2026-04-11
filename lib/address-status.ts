export type AddressStatus = "inactive" | "pending_review" | "active";

const STORAGE_KEY = "aibc_address_status";
export const ADDRESS_STATUS_EVENT = "aibc-address-status-change";

const isValidStatus = (value: unknown): value is AddressStatus =>
  value === "inactive" || value === "pending_review" || value === "active";

export const getAddressStatus = (): AddressStatus => {
  if (typeof window === "undefined") {
    return "inactive";
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (isValidStatus(stored)) {
    return stored;
  }

  return "inactive";
};

export const setAddressStatus = (status: AddressStatus) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, status);
  window.dispatchEvent(new CustomEvent(ADDRESS_STATUS_EVENT, { detail: status }));
};
