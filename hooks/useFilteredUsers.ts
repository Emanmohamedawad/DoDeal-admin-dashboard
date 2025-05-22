import { useMemo } from 'react';
import type { User } from '../store/userSlice'; // Assuming User type is here

/**
 * Filters and sorts a list of users by name.
 * @param users The list of users.
 * @param searchTerm The term to filter by name.
 * @returns The filtered and sorted list of users.
 */
export function useFilteredUsers(users: User[], searchTerm: string): User[] {
  const filteredAndSortedUsers = useMemo(() => {
    return users
      .filter((user: User) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a: User, b: User) => a.id - b.id);
  }, [users, searchTerm]); // Recompute only when users or searchTerm changes

  return filteredAndSortedUsers;
}