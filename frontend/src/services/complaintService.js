
const API_BASE_URL = "http://127.0.0.1:8000";

export const submitComplaint = async (complaintData) => {
  const requestData = {
    citizen_name: complaintData.citizen_name.trim(),
    mobile: complaintData.mobile_number.trim(),
    email: complaintData.email.trim() || null,
    title: complaintData.complaint_title.trim(),
    description: complaintData.description.trim(),
    language: complaintData.language || "English",
    category: complaintData.category || null,
    location: [
      complaintData.district,
      complaintData.location,
    ]
      .filter(Boolean)
      .join(", "),
    priority: "Medium",
  };

  const response = await fetch(
    `${API_BASE_URL}/api/complaints/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    const message = Array.isArray(result.detail)
      ? result.detail.map((item) => item.msg).join(", ")
      : result.detail || "Complaint registration failed.";

    throw new Error(message);
  }

  if (!result.complaint_id) {
    throw new Error("Backend did not return a complaint ID.");
  }

  return {
    success: true,
    complaint_id: result.complaint_id,
    status: result.status || "Pending",
  };
};

export const getComplaintById = async (complaintId) => {
  const response = await fetch(
    `${API_BASE_URL}/api/complaints/${encodeURIComponent(complaintId.trim())}`
  );

  const result = await response.json();

  if (!response.ok) {
    const message =
      typeof result.detail === "string"
        ? result.detail
        : "Complaint not found. Please check your Complaint ID.";

    throw new Error(message);
  }

  return result;
};
