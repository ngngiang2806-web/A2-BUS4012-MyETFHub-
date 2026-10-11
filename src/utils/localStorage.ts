/** Remove insecure data written by the previous localStorage-only MVP.
 * Supabase Auth now manages sessions and the API/database store application data.
 */
export function clearLegacyDemoData(): void {
  const legacyKeys = ["myetfhub_profile", "myetfhub_holdings", "myetfhub_step", "myetfhub_users", "myetfhub_current_user"];
  legacyKeys.forEach((key) => localStorage.removeItem(key));

  Object.keys(localStorage)
    .filter((key) => key.startsWith("myetfhub_profile_") || key.startsWith("myetfhub_holdings_"))
    .forEach((key) => localStorage.removeItem(key));
}