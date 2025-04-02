const fetchEvents = async () => {
    const { data, error } = await supabase.auth.getSession();
    const session = data.session;
    if (!session) {
      console.error("❗ No Supabase session found");
      return;
    }

    const supabaseToken = session.access_token;
    const provider = localStorage.getItem("authProvider");
    const googleToken = localStorage.getItem("googleToken");
    const microsoftToken = localStorage.getItem("microsoftToken");
    console.log("googleToken:", googleToken); // ตรวจสอบว่า token นี้ถูกดึงมาได้หรือไม่
    console.log("microsoftToken:", microsoftToken);
    const accessToken = provider === "google" ? googleToken : microsoftToken;

    console.log("🔍 Fetch Events Headers:", {
      Authorization: `Bearer ${supabaseToken}`,
      provider: provider,
      accessToken: accessToken
    });

    try {
      const res = await fetch("http://localhost:8081/calendar/events", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${supabaseToken}`,
          provider: provider,
          accessToken: accessToken
        }
      });

      console.log("🔍 Response status:", res.status);

      if (!res.ok) {
        const errorText = await res.text();
        console.error("❗ Response Error:", errorText);
        throw new Error("Failed to fetch events");
      }

      const data = await res.json();
      console.log("✅ Events:", data);

      // 🎯 Set events ให้แสดงใน calendar
      if (provider === "google") {
        setEvents(
          data.items.map((item) => ({
            id: item.id,
            title: item.summary,
            start: new Date(item.start.dateTime || item.start.date),
            end: new Date(item.end.dateTime || item.end.date),
            allDay: !item.start.dateTime,
            description: item.description || "",
            location: item.location || "",
            color: "#4285F4"
          }))
        );
      } else if (provider === "microsoft") {
        setEvents(
          data.value.map((item) => ({
            id: item.id,
            title: item.subject,
            start: new Date(item.start.dateTime + "Z"),
            end: new Date(item.end.dateTime + "Z"),
            allDay: false,
            description: item.bodyPreview || "",
            location: item.location?.displayName || "",
            color: "#0078D4"
          }))
        );
      }
    } catch (err) {
      console.error("❗ Fetch events failed:", err.message);
    }
  };