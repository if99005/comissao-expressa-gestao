
import { ProposalLine } from "@/types/proposal";

export const calculateLineFromPVP = (unitPrice: number, marginPercent: number) => {
  const marginEuro = (unitPrice * marginPercent) / 100;
  const costPrice = unitPrice - marginEuro;
  return { marginEuro, costPrice };
};

export const calculateLineFromCost = (costPrice: number, marginValue: number, isPercentage: boolean) => {
  let marginEuro: number;
  let marginPercent: number;
  let unitPrice: number;

  if (isPercentage) {
    marginPercent = marginValue;
    marginEuro = (costPrice * marginPercent) / 100;
    unitPrice = costPrice + marginEuro;
  } else {
    marginEuro = marginValue;
    unitPrice = costPrice + marginEuro;
    marginPercent = costPrice > 0 ? (marginEuro / costPrice) * 100 : 0;
  }

  return { marginEuro, marginPercent, unitPrice };
};

export const calculateLineTotals = (lines: ProposalLine[], discountPercentage: number = 0) => {
  const subtotal = lines.reduce((sum, line) => sum + line.line_total, 0);
  const discountAmount = subtotal * (discountPercentage / 100);
  const total = subtotal - discountAmount;
  
  return { subtotal, total };
};
