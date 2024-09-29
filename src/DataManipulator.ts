import { ServerRespond } from './DataStreamer';

/**
 * Update the Row interface in DataManipulator.ts to match the new schema in Graph.tsx.
 * This ensures the object returned by generateRow corresponds to the table's schema.
 */

export interface Row {
  price_abc: number,
  price_def: number,
  ratio: number,
  timestamp: Date,
  upper_bound: number,
  lower_bound: number,
  trigger_alert: number | undefined,
}

/**
 * Update the generateRow function in DataManipulator to process raw server data.
 * - Calculate price_abc and price_def using top_ask and top_bid prices.
 * - Compute the ratio, set upper and lower bounds at +/-10%, and determine trigger_alert.
 * - Return a single Row object instead of an array.
 */
export class DataManipulator {
  static generateRow(serverRespond: ServerRespond[]): Row {
    const priceABC = (serverRespond[0].top_ask.price + serverRespond[0].top_bid.price) / 2;
    const priceDEF = (serverRespond[1].top_ask.price + serverRespond[1].top_bid.price) / 2;
    const ratio = priceABC / priceDEF;
    const upperBound = 1 + 0.1;
    const lowerBound = 1 - 0.01;
    return {
      price_abc: priceABC,
      price_def: priceDEF,
      ratio,
      timestamp: serverRespond[0].timestamp > serverRespond[1].timestamp ? serverRespond[0].timestamp : serverRespond[1].timestamp,
      upper_bound: upperBound,
      lower_bound: lowerBound,
      trigger_alert: (ratio > upperBound || ratio < lowerBound) ? ratio : undefined,
    };
  }
}
