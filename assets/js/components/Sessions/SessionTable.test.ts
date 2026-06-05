import { describe, expect, test } from "vitest";
import { shallowMount } from "@vue/test-utils";
import SessionTable from "./SessionTable.vue";
import { CURRENCY } from "@/types/evcc";

const baseSession = {
  id: 1,
  created: "2026-06-01T10:00:00Z",
  finished: "2026-06-01T11:00:00Z",
  loadpoint: "lp1",
  identifier: "",
  vehicle: "car1",
  odometer: 0,
  meterStart: 0,
  meterStop: 0,
  chargedEnergy: 10,
  chargeDuration: 3_600_000_000_000,
  socStart: null,
  socEnd: null,
  solarPercentage: 0,
  price: 0,
  pricePerKWh: null,
  co2PerKWh: null,
};

const mountTable = (sessions: any[]) =>
  shallowMount(SessionTable, {
    props: { sessions, currency: CURRENCY.EUR },
    global: {
      mocks: {
        $t: (key: string) => key,
        $i18n: { locale: "en" },
        $router: { push: () => undefined },
        $route: { query: {} },
      },
    },
  });

describe("SessionTable monthly reimbursement", () => {
  test("computes monthly totals and profit for same monthly rate", () => {
    const wrapper = mountTable([
      { ...baseSession, id: 1, price: 10, reimbursementMonthly: 50 },
      {
        ...baseSession,
        id: 2,
        created: "2026-06-02T10:00:00Z",
        price: 5,
        reimbursementMonthly: 50,
      },
    ]);

    expect((wrapper.vm as any).monthlyReimbursementTotal).toBe(50);
    expect((wrapper.vm as any).monthlyReimbursementProfit).toBe(35);
    expect((wrapper.vm as any).columns.map((c: any) => c.name)).toContain("profit");
  });

  test("returns null when monthly rates differ", () => {
    const wrapper = mountTable([
      { ...baseSession, id: 1, reimbursementMonthly: 50 },
      { ...baseSession, id: 2, created: "2026-06-02T10:00:00Z", reimbursementMonthly: 60 },
    ]);

    expect((wrapper.vm as any).monthlyReimbursementTotal).toBeNull();
    expect((wrapper.vm as any).monthlyReimbursementProfit).toBeNull();
  });
});
