/**
 * Private contact-form notification relay for Build With Duke.
 *
 * Script properties required:
 * - RELAY_SECRET: the same long random value as Cloudflare CONTACT_RELAY_SECRET
 * - NOTIFICATION_EMAIL: the Gmail address that should receive lead alerts
 * - BUSINESS_REPLY_EMAIL: buildwithduke@outlook.com
 */
function doPost(event) {
  try {
    var properties = PropertiesService.getScriptProperties();
    var expectedSecret = properties.getProperty("RELAY_SECRET") || "";
    var notificationEmail = properties.getProperty("NOTIFICATION_EMAIL") || "";
    var businessReplyEmail = properties.getProperty("BUSINESS_REPLY_EMAIL") || "";
    var payload = JSON.parse(event && event.postData && event.postData.contents || "{}");

    if (!expectedSecret || !constantTimeEqual(String(payload.relaySecret || ""), expectedSecret)) return jsonResponse({ ok: false });
    if (!isEmail(notificationEmail) || !isEmail(businessReplyEmail)) throw new Error("Mail addresses are not configured.");

    var lead = {
      name: clean(payload.name, 120),
      email: clean(payload.email, 254).toLowerCase(),
      company: clean(payload.company, 160),
      projectType: clean(payload.projectType, 160),
      budget: clean(payload.budget, 120),
      message: clean(payload.message, 5000)
    };
    if (!lead.name || !isEmail(lead.email) || lead.message.length < 20) throw new Error("Lead details are invalid.");
    if (MailApp.getRemainingDailyQuota() < 1) throw new Error("The daily mail quota is exhausted.");

    var subject = "New project enquiry from " + lead.name;
    var plainBody = [
      lead.name + " (" + lead.email + ") sent a project enquiry.",
      "",
      "Company: " + (lead.company || "Not supplied"),
      "Project: " + (lead.projectType || "Not supplied"),
      "Budget: " + (lead.budget || "Not supplied"),
      "",
      lead.message,
      "",
      "Reply from the Build With Duke admin dashboard or your Outlook app."
    ].join("\n");
    var outlookDraft = "mailto:" + encodeURIComponent(lead.email) + "?subject=" + encodeURIComponent("Re: Your Build With Duke enquiry");
    var htmlBody = "<p><strong>" + escapeHtml(lead.name) + "</strong> (" + escapeHtml(lead.email) + ") sent a project enquiry.</p>" +
      "<p><strong>Company:</strong> " + escapeHtml(lead.company || "Not supplied") + "<br>" +
      "<strong>Project:</strong> " + escapeHtml(lead.projectType || "Not supplied") + "<br>" +
      "<strong>Budget:</strong> " + escapeHtml(lead.budget || "Not supplied") + "</p>" +
      "<p>" + escapeHtml(lead.message).replace(/\n/g, "<br>") + "</p>" +
      "<p><a href=\"" + escapeHtml(outlookDraft) + "\">Draft a reply from " + escapeHtml(businessReplyEmail) + "</a></p>";

    MailApp.sendEmail({
      to: notificationEmail,
      subject: subject,
      body: plainBody,
      htmlBody: htmlBody,
      name: "Build With Duke website",
      replyTo: lead.email
    });
    return jsonResponse({ ok: true });
  } catch (error) {
    console.error(error);
    return jsonResponse({ ok: false });
  }
}

function doGet() {
  return jsonResponse({ ok: true, service: "buildwithduke-contact-relay" });
}

function clean(value, maximumLength) {
  return String(value == null ? "" : value).trim().slice(0, maximumLength);
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || ""));
}

function escapeHtml(value) {
  return String(value).replace(/[&<>\"]/g, function (character) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[character];
  });
}

function constantTimeEqual(left, right) {
  var mismatch = left.length ^ right.length;
  var length = Math.max(left.length, right.length);
  for (var index = 0; index < length; index += 1) mismatch |= (left.charCodeAt(index % Math.max(left.length, 1)) || 0) ^ (right.charCodeAt(index % Math.max(right.length, 1)) || 0);
  return mismatch === 0;
}

function jsonResponse(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
