const API_BASE_URL = "http://127.0.0.1:8000";

export const submitComplaint = async (complaintData) => {
  const token = sessionStorage.getItem("citizenToken");

  if (!token) {
    throw new Error("Please login as a citizen before submitting a complaint.");
  }

  const formData = new FormData();

  formData.append("citizen_name", complaintData.citizen_name.trim());
  formData.append("mobile", complaintData.mobile_number.trim());
  formData.append("title", complaintData.complaint_title.trim());
  formData.append("description", complaintData.description.trim());
  formData.append("language", complaintData.language || "English");
  formData.append("priority", "Medium");

  formData.append(
    "location",
    [complaintData.district, complaintData.location]
      .filter(Boolean)
      .join(", ")
  );

  if (complaintData.email?.trim()) {
    formData.append("email", complaintData.email.trim());
  }

  if (complaintData.category) {
    formData.append("category", complaintData.category);
  }

  if (complaintData.document) {
    formData.append("document", complaintData.document);
  }

  const response = await fetch(`${API_BASE_URL}/api/complaints/`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

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
  const token =
    sessionStorage.getItem("citizenToken") ||
    sessionStorage.getItem("adminToken");

  const response = await fetch(
    `${API_BASE_URL}/api/complaints/${encodeURIComponent(complaintId.trim())}`,
    {
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    const message = typeof result.detail === "string"
      ? result.detail
      : Array.isArray(result.detail)
        ? result.detail.map((item) => item.msg).join(", ")
        : "Complaint not found. Please check your Complaint ID.";

    throw new Error(message);
  }

  return result;
};
