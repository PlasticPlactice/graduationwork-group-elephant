declare module "@/lib/validateEventDates" {
  export type EventDateInputs = {
    start_period?: string | Date | null;
    end_period?: string | Date | null;
    first_voting_start_period?: string | Date | null;
    first_voting_end_period?: string | Date | null;
    second_voting_start_period?: string | Date | null;
    second_voting_end_period?: string | Date | null;
  };

  export function validateEventDates(d: EventDateInputs): string[] | null;
}
