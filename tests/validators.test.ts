import { describe, expect, it } from "vitest";

import { authSchema } from "@/validators/auth";
import { commentSchema } from "@/validators/comment";
import { gearSchema } from "@/validators/gear";
import { postSchema } from "@/validators/post";
import {
  editProfileSchema,
  profileSchema,
  usernameSchema,
} from "@/validators/profile";

describe("authSchema", () => {
  it("accepts valid email/password credentials", () => {
    expect(
      authSchema.safeParse({
        email: "player@example.com",
        password: "strings123",
      }).success,
    ).toBe(true);
  });

  it("rejects invalid email addresses and short passwords", () => {
    const result = authSchema.safeParse({
      email: "not-an-email",
      password: "12345",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.path.join("."))).toEqual([
        "email",
        "password",
      ]);
    }
  });
});

describe("profile validators", () => {
  it("accepts usernames that match the public profile URL rules", () => {
    expect(usernameSchema.safeParse("player_123").success).toBe(true);
  });

  it.each(["ab", "Player", "player-name", "this_username_is_way_too_long"])(
    "rejects invalid username %s",
    (username) => {
      expect(usernameSchema.safeParse(username).success).toBe(false);
    },
  );

  it("allows nullable optional profile fields", () => {
    expect(
      profileSchema.safeParse({
        username: "jazzline",
        display_name: null,
        bio: "Mostly offsets and tiny amps.",
        location: null,
      }).success,
    ).toBe(true);
  });

  it("enforces edit profile field limits", () => {
    expect(
      editProfileSchema.safeParse({
        display_name: "x".repeat(61),
        bio: "x".repeat(281),
        location: "x".repeat(61),
      }).success,
    ).toBe(false);
  });
});

describe("gearSchema", () => {
  it("accepts a complete rig item", () => {
    expect(
      gearSchema.safeParse({
        kind: "guitar",
        brand: "Fender",
        model: "American Professional II Stratocaster",
        year: 2024,
        notes: "SSS, maple board.",
      }).success,
    ).toBe(true);
  });

  it("rejects missing required gear names and unsupported kinds", () => {
    expect(
      gearSchema.safeParse({
        kind: "keyboard",
        brand: "",
        model: "",
      }).success,
    ).toBe(false);
  });

  it("rejects implausible production years", () => {
    const nextAllowedYear = new Date().getFullYear() + 1;

    expect(
      gearSchema.safeParse({
        kind: "amp",
        brand: "Vox",
        model: "AC30",
        year: nextAllowedYear + 1,
      }).success,
    ).toBe(false);
  });
});

describe("post and comment validators", () => {
  it("accepts optional post captions up to the app limit", () => {
    expect(postSchema.safeParse({ caption: "x".repeat(500) }).success).toBe(
      true,
    );
    expect(postSchema.safeParse({ caption: null }).success).toBe(true);
  });

  it("rejects captions over 500 characters", () => {
    expect(postSchema.safeParse({ caption: "x".repeat(501) }).success).toBe(
      false,
    );
  });

  it("requires non-empty comments under the app limit", () => {
    expect(commentSchema.safeParse({ body: "Great tone." }).success).toBe(
      true,
    );
    expect(commentSchema.safeParse({ body: "" }).success).toBe(false);
    expect(commentSchema.safeParse({ body: "x".repeat(501) }).success).toBe(
      false,
    );
  });
});
