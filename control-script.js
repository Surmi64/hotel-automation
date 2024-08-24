async function sendCommandToShelly(ip, username, password) {
  const url = `http://${ip}/rpc`;

  // Manually create the Authorization header without using Buffer
  const auth = `Basic ${btoa(`${username}:${password}`)}`;

  const data = {
    id: 1,
    method: "Script.Start",
    params: {
      id: 1,
    },
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: auth,
      },
      body: JSON.stringify(data), // Convert the data object to a JSON string
    });

    const rawResponse = await response.text();
    console.log("Raw Response:", rawResponse);

    const contentType = response.headers.get("content-type");
    let result;

    if (
      response.ok &&
      contentType &&
      contentType.includes("application/json")
    ) {
      result = JSON.parse(rawResponse);
    } else if (!response.ok) {
      throw new Error(
        `Request failed with status ${response.status} and message: ${rawResponse}`
      );
    } else {
      result = rawResponse;
    }

    console.log(result);
  } catch (error) {
    console.error("Error:", error);
  }
}

sendCommandToShelly("192.168.68.130", "admin", "stumpfimre"); // Replace with your device IP, username, and password
