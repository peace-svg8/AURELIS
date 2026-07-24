async function testOrder() {
  const payload = {
    customer: {
      fullName: "Hacker Man",
      email: "hacker@example.com",
      phone: "1234567890",
      address: "123 Hack St",
      city: "Hackerville",
      zipCode: "12345",
      country: "USA"
    },
    items: [
      {
        id: "1", // Aeterna Solaris
        name: "Aeterna Solaris",
        variant: "Gold Mesh",
        price: 1, // Malicious price of $1 instead of $1899
        quantity: 1
      }
    ]
  };

  const response = await fetch('http://localhost:3001/api/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  console.log("Status:", response.status);
  console.log("Response:", data);

  if (response.ok) {
    // If the order succeeded, let's verify if the database stored the true price or the hacked price
    const verifyResp = await fetch('http://localhost:3001/api/orders');
    const verifyData = await verifyResp.json();
    const myOrder = verifyData.orders.find(o => o.id === data.orderId);
    console.log("Stored Total Amount in DB:", myOrder.totalAmount);
    console.log("True price should be 1899. If total is 1, verification failed!");
  }
}

testOrder();
