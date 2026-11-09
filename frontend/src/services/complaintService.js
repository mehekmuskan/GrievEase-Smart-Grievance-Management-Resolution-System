const API_BASE_URL = "http://127.0.0.1:8000";

export const submitComplaint = async (complaintData) => {
  const requestData = new FormData();

  requestData.append("citizen_name", complaintData.citizen_name.trim());
  requestData.append("mobile", complaintData.mobile_number.trim());
  requestData.append("email", complaintData.email.trim());
  requestData.append("title", complaintData.complaint_title.trim());
  requestData.append("description", complaintData.description.trim());
  requestData.append("language", complaintData.language || "English");
  requestData.append("category", complaintData.category || "");

  requestData.append(
    "location",
    [
      complaintData.district,
      complaintData.location,
    ].filter(Boolean).join(", ")
  );

  requestData.append("priority", "Medium");

  if (complaintData.document) {
    requestData.append("document", complaintData.document);
  }

  const response = await fetch(
    `${API_BASE_URL}/api/complaints/`,
    {
      method: "POST",
      body: requestData,
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
    `${API_BASE_URL}/api/complaints/${encodeURIComponent(
      complaintId.trim()
    )}`
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