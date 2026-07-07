"use server";

import { getActiveNeighborhoods as getNeighborhoodsFromService } from "@/services/neighborhoods";

export async function getActiveNeighborhoods() {
  return await getNeighborhoodsFromService();
}
