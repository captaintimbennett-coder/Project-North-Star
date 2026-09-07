import assert from "node:assert/strict";
import test from "node:test";
import type { Payload } from "payload";
import type { User } from "../src/payload-types";
import { getModelAvailabilityDays } from "../src/lib/scheduling/availability-service";
import { getSharedRetreatSchedule } from "../src/lib/auth/schedule-projection";
import { validateProfileAccountRole } from "../src/payload/hooks/validateProfileAccountRole";

for (const role of ["model", "photographer"] as const) {
  for (const status of ["invited", "confirmed", "approved", "withdrawn"]) {
    test(`${role}: ${status} event assignment enforces shared schedule access`, async () => {
      let bookingReads = 0;
      const account = { id: 7, accountStatus: "active", roles: [role] } as User;
      const payload = {
        findByID: async () => ({
          id: 1,
          participatingArtists: [{ artist: 10, participationStatus: role === "model" ? status : "approved" }],
          participatingPhotographers: [{ photographer: 20, participationStatus: status }],
        }),
        find: async ({ collection }: { collection: string }) => {
          if (collection === "model-profiles") return { docs: [{ id: 10 }] };
          if (collection === "photographer-profiles") return { docs: [{ id: 20 }] };
          bookingReads++;
          return { docs: [] };
        },
      } as unknown as Payload;
      await getSharedRetreatSchedule(account, 1, { payload });
      assert.equal(bookingReads, role === "model"
        ? Number(["confirmed", "approved"].includes(status))
        : Number(status === "approved"));
    });
  }
  test(`${role}: profile rejects an account with the other participant role`, async () => {
    const hook = validateProfileAccountRole(role);
    const args = {
      data: { account: 7 },
      req: { payload: { findByID: async () => ({ roles: [role === "model" ? "photographer" : "model"] }) } },
    } as unknown as Parameters<typeof hook>[0];
    await assert.rejects(async () => hook(args), /linked account must include/);
  });
}

test("newly linked Featured Artist receives retreat days without pre-created availability", async () => {
  const payload = {
    find: async ({ collection }: { collection: string }) => ({ docs:
      collection === "model-profiles" ? [{ id: 10 }] :
      collection === "retreat-events" ? [{
        id: 1, title: "Test retreat", timeZone: "America/Chicago",
        startDate: "2027-05-14T12:00:00Z", endDate: "2027-05-16T23:00:00Z",
        participatingArtists: [{ artist: 10, participationStatus: "confirmed" }],
      }] : [],
    }),
  } as unknown as Payload;
  const days = await getModelAvailabilityDays({ id: 7, accountStatus: "active", roles: ["model"] } as User, { payload });
  assert.equal(days.length, 3);
  assert.equal(days[0].availableFrom, "06:00");
  assert.equal(days[0].availableUntil, "18:00");
});

test("suspended Featured Artist cannot load availability", async () => {
  const payload = { find: async () => { throw new Error("Must not read participant data"); } } as unknown as Payload;
  assert.deepEqual(await getModelAvailabilityDays({ id: 7, accountStatus: "suspended", roles: ["model"] } as User, { payload }), []);
});
