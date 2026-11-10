import API_BASE_URL from "./api";

export const classifyGrievance = async (title, description) => {
  const response = await fetch(`${API_BASE_URL}/api/ai/classify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      title: title.trim(),
      description: description.trim(),
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "AI classification failed.");
  }

  return response.json();
};

export const submitComplaint = async (complaintData) => {
  const token = sessionStorage.getItem("citizenToken");

  const formData = new FormData();

  formData.append("citizen_name", complaintData.citizen_name.trim());
  formData.append("mobile", complaintData.mobile_number.trim());
  formData.append("title", complaintData.complaint_title.trim());
  formData.append("description", complaintData.description.trim());
  formData.append("language", complaintData.language || "English");
  formData.append("priority", complaintData.priority || "Medium");

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

  const headers = {
    Accept: "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/complaints/`, {
    method: "POST",
    headers,
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
