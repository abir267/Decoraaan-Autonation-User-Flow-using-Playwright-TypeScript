export function generateUser() {
  const timestamp = Date.now();

  const firstName = "Auto";
  const lastName = `User${timestamp}`;
  const fullName = `${firstName} ${lastName}`;
  const email = `testuserQAP1_${timestamp}@yopmail.com`;
  const password = "Test@12345";

  return {
    firstName,
    lastName,
    fullName,
    email,
    password,
  };
}