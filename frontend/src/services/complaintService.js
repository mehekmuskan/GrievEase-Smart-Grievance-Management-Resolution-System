
// Temporary mock service
// Replace with FastAPI Axios calls when backend is ready.

export const submitComplaint = async (complaintData) => {
  // Simulate backend processing delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Generate temporary complaint ID
  const complaintId =
    "GRV-" + Date.now().toString().slice(-8);

  const mockResponse = {
    success: true,
    message: "Complaint registered successfully!",
    complaint_id: complaintId,
    status: "Pending",
    complaint: {
      citizen_name: complaintData.citizen_name,
      complaint_title: complaintData.complaint_title,
      category: complaintData.category,
      district: complaintData.district,
    },
  };

  console.log("Temporary Mock Complaint:", complaintData);
  console.log("Mock Backend Response:", mockResponse);

  return mockResponse;
};
