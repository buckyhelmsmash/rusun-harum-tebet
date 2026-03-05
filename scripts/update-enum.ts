async function run() {
  const res = await fetch(
    "https://sgp.cloud.appwrite.io/v1/databases/69a47644000b6bb85e41/collections/activity_logs/attributes/enum/targetType",
    {
      method: "PATCH",
      headers: {
        "X-Appwrite-Project": "rusun-harum-tebet",
        "X-Appwrite-Key": process.env.APPWRITE_API_KEY as string,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        elements: [
          "owner",
          "unit",
          "tenant",
          "vehicle",
          "invoice",
          "water_usage",
          "settings",
        ],
        required: false,
        default: "unit",
      }),
    },
  );
  const data = await res.json();
  console.log(data);
}

run();
