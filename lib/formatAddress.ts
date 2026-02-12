export const formatAddress = (
  address?: string | null,
  subAddress?: string | null,
): string => {
  if (!address) return "-";
  if (address === "岩手県" && subAddress) return `${address}${subAddress}`;
  return address;
};

export default formatAddress;
