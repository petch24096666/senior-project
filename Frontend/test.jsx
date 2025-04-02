const fetchEvents = async () => {
    const session = supabase.auth.session();
    if (!session) {
      console.error("❗ No Supabase session found");
      return;
    }

    const provider = localStorage.getItem("authProvider");
    const accessToken = localStorage.getItem(provider === "google" ? "googleToken" : "microsoftToken");

    if (!accessToken) {
      console.error("❗ No access token found for provider:", provider);
      return;
    }

    try {
      const res = await fetch("http://localhost:8081/calendar/events", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          provider: provider,
          accessToken: accessToken
        }
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("❗ Response Error:", errorText);
        throw new Error("Failed to fetch events");
      }

      const data = await res.json();
      setEvents(data.map(event => ({
        id: event.id,
        title: event.title,
        start: new Date(event.start),
        end: new Date(event.end),
        allDay: event.allDay,
        description: event.description,
        location: event.location,
        color: provider === "google" ? "#4285F4" : "#0078D4"
      })));

    } catch (err) {
      console.error("❗ Fetch events failed:", err.message);
    }
};