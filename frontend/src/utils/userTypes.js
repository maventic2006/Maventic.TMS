import api from "./api";

// Cache for user types to avoid repeated API calls
let userTypesCache = null;
let roleMapping = null;

// Default role mapping (fallback)
const DEFAULT_ROLE_MAPPING = {
  UT001: "product_owner", // Owner -> Product Owner
  UT002: "transporter", // Transporter
  UT003: "transporter", // Independent Vehicle Owner -> Transporter
  UT004: "transporter", // Transporter Contact -> Transporter
  UT005: "transporter", // Vehicle Ownership -> Transporter
  UT006: "consignor", // Consignor WH -> Consignor
  UT007: "driver", // Driver
  UT008: "consignor", // Consignor
};

/**
 * Fetch user types from the database
 */
export const fetchUserTypes = async () => {
  try {
    if (userTypesCache) {
      return userTypesCache;
    }

    const response = await api.get("/auth/user-types");

    if (response.data.success) {
      userTypesCache = response.data.userTypes;
      return userTypesCache;
    } else {
      console.error("Failed to fetch user types:", response.data.message);
      return [];
    }
  } catch (error) {
    console.error("Error fetching user types:", error);
    return [];
  }
};

/**
 * Create dynamic role mapping based on database user types
 */
export const createRoleMapping = async () => {
  try {
    if (roleMapping) {
      return roleMapping;
    }

    const userTypes = await fetchUserTypes();
    const dynamicMapping = {};

    userTypes.forEach((userType) => {
      // Map based on user type name patterns
      const typeName = userType.user_type_name?.toLowerCase() || "";

      if (typeName.includes("owner") || typeName.includes("product")) {
        dynamicMapping[userType.user_type_id] = "product_owner";
      } else if (
        typeName.includes("transporter") ||
        typeName.includes("vehicle")
      ) {
        dynamicMapping[userType.user_type_id] = "transporter";
      } else if (typeName.includes("consignor")) {
        dynamicMapping[userType.user_type_id] = "consignor";
      } else if (typeName.includes("driver")) {
        dynamicMapping[userType.user_type_id] = "driver";
      } else if (typeName.includes("admin")) {
        dynamicMapping[userType.user_type_id] = "admin";
      } else {
        // Fallback to default mapping
        dynamicMapping[userType.user_type_id] =
          DEFAULT_ROLE_MAPPING[userType.user_type_id] || "user";
      }
    });

    roleMapping = dynamicMapping;
    return roleMapping;
  } catch (error) {
    console.error("Error creating role mapping:", error);
    // Return default mapping on error
    return DEFAULT_ROLE_MAPPING;
  }
};

/**
 * Map user type ID to role using database-driven mapping
 */
export const mapUserTypeToRole = async (user_type_id) => {
  try {
    const mapping = await createRoleMapping();
    return mapping[user_type_id] || "user";
  } catch (error) {
    console.error("Error mapping user type to role:", error);
    // Fallback to default mapping
    return DEFAULT_ROLE_MAPPING[user_type_id] || "user";
  }
};

/**
 * Clear cache (useful for testing or when user types change)
 */
export const clearUserTypesCache = () => {
  userTypesCache = null;
  roleMapping = null;
};

/**
 * Get all available roles
 */
export const getAvailableRoles = async () => {
  try {
    const mapping = await createRoleMapping();
    return [...new Set(Object.values(mapping))];
  } catch (error) {
    console.error("Error getting available roles:", error);
    return ["admin", "consignor", "transporter", "driver", "product_owner"];
  }
};
