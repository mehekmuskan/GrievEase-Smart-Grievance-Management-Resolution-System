
const API_BASE_URL = "http://127.0.0.1:8000";

// Register a new complaint
export const submitComplaint = async (complaintData) => {
  const formData = new FormData();

  // Required fields
  formData.append(
    "citizen_name",
    complaintData.citizen_name.trim()
  );

  formData.append(
    "mobile",
    complaintData.mobile_number.trim()
  );

  formData.append(
    "title",
    complaintData.complaint_title.trim()
  );

  formData.append(
    "description",
    complaintData.description.trim()
  );

  // Optional and default fields
  formData.append(
    "language",
    complaintData.language || "English"
  );

  formData.append("priority", "Medium");

  formData.append(
    "location",
    [
      complaintData.district,
      complaintData.location,
    ]
      .filter(Boolean)
      .join(", ")
  );

  if (complaintData.email?.trim()) {
    formData.append("email", complaintData.email.trim());
  }

  if (complaintData.category) {
    formData.append("category", complaintData.category);
  }

  // Supporting document upload
  if (complaintData.document) {
    formData.append("document", complaintData.document);
  }

  const response = await fetch(
    `${API_BASE_URL}/api/complaints/`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: formData,
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


// Track complaint using complaint ID
export const getComplaintById = async (complaintId) => {
  const response = await fetch(
    `${API_BASE_URL}/api/complaints/${encodeURIComponent(
      complaintId.trim()
    )}`,
    {
      headers: {
        Accept: "application/json",
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    const message =
      typeof result.detail === "string"
        ? result.detail
        : Array.isArray(result.detail)
          ? result.detail.map((item) => item.msg).join(", ")
          : "Complaint not found. Please check your Complaint ID.";

    throw new Error(message);
  }

  return result;
};
