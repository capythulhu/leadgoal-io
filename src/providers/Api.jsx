import React, { createContext, useContext, useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { firebaseConfig } from "../config/api";
import { useNavigate } from "react-router-dom";

// Create the context
const ApiContext = createContext(null);

// Custom hook to use the API context
export const useApi = () => {
  return useContext(ApiContext);
};

export const ApiProvider = ({ children, localID }) => {
  // Initialize Firebase and Firestore
  const app = initializeApp(firebaseConfig);
  getAnalytics(app);
  const db = getFirestore(app);

  const navigate = useNavigate();

  const [secretID, setSecretID] = useState(null);
  const [project, setProject] = useState(null);
  const [projectID, setProjectID] = useState(null); // Store projectID for easy reference
  const [leads, setLeads] = useState([]); // Store leads
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchProjectData = async () => {
      if (!localID) return;

      // First, attempt to treat `id` as a secretID and get the projectID from the secrets collection
      const secretDocRef = doc(db, "secrets", localID);
      const secretSnap = await getDoc(secretDocRef);

      if (secretSnap.exists()) {
        // If secretSnap exists, we have a valid secretID
        setSecretID(localID);
        const { projectID } = secretSnap.data();
        if (!projectID) {
          console.error(
            "Secret document found but does not contain projectID."
          );
          return;
        }

        // Fetch the corresponding project
        const projectDocRef = doc(db, "projects", projectID);
        const projectSnap = await getDoc(projectDocRef);
        if (projectSnap.exists()) {
          setProject(projectSnap.data());
          setProjectID(projectID);
        } else {
          console.warn("No project found for the given projectID.");
        }
      } else {
        // If no secretDoc is found, `id` might be a direct projectID
        const projectDocRef = doc(db, "projects", localID);
        const projectSnap = await getDoc(projectDocRef);
        if (projectSnap.exists()) {
          setProject(projectSnap.data());
          setProjectID(localID);
        } else {
          console.warn("No project found for the given ID.");
          navigate("/");
        }
      }
    };

    setIsLoading(true);
    fetchProjectData().then(() => setIsLoading(false));
  }, [localID, db, navigate]);

  // Fetch leads once we have a projectID
  useEffect(() => {
    const fetchLeads = async () => {
      if (!projectID) return;

      setIsLoading(true);
      try {
        const leadsCollectionRef = collection(
          db,
          "projects",
          projectID,
          "leads"
        );
        const leadsSnap = await getDocs(leadsCollectionRef);
        const leadsData = leadsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setLeads(leadsData);
      } catch (error) {
        console.error("Error fetching leads:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeads();
  }, [projectID, db]);

  /**
   * Adds a new project and a corresponding secret.
   * @param {object} projectData - The project data to add.
   * @returns {Promise<[string, string] | null>} A promise that resolves to an array [projectID, secretID] or null on error.
   */
  const addProject = async (projectData) => {
    try {
      setIsLoading(true);
      console.log("Attempting to add project:", projectData);

      // Adding project document
      const projectRef = await addDoc(collection(db, "projects"), projectData);
      console.log("Project added with ID:", projectRef.id);

      // Adding secret document
      const secretRef = await addDoc(collection(db, "secrets"), {
        projectID: projectRef.id,
      });
      console.log("Secret added with ID:", secretRef.id);

      setSecretID(secretRef.id);
      setProject(projectData);
      setProjectID(projectRef.id);

      setIsLoading(false);
      navigate(`/${secretRef.id}`);
      return [projectRef.id, secretRef.id];
    } catch (e) {
      console.error("Error adding project:", e);
      setIsLoading(false);
      return null;
    }
  };

  /**
   * Updates a project using the stored secretID.
   * @param {object} updatedData - The updated project data.
   * @returns {Promise<boolean>} True if successful, false otherwise.
   */
  const updateProject = async (updatedData) => {
    if (!secretID) {
      console.error("No secretID available. Cannot update project.");
      return false;
    }

    try {
      setIsLoading(true);
      const secretDocRef = doc(db, "secrets", secretID);
      const secretSnap = await getDoc(secretDocRef);

      if (!secretSnap.exists()) {
        throw new Error("Invalid secretID: No matching secret document found.");
      }

      const { projectID } = secretSnap.data();
      if (!projectID) {
        throw new Error("Secret document does not contain a projectID.");
      }

      const projectDocRef = doc(db, "projects", projectID);
      await updateDoc(projectDocRef, updatedData);
      setProject(updatedData);
      console.log("Project updated successfully.");
      setIsLoading(false);
      return true;
    } catch (e) {
      console.error("Error updating project: ", e);
      setIsLoading(false);
      return false;
    }
  };

  /**
   * Deletes a project using the stored secretID.
   * @returns {Promise<boolean>} True if successful, false otherwise.
   */
  const deleteProject = async () => {
    if (!secretID) {
      console.error("No secretID available. Cannot delete project.");
      return false;
    }

    try {
      setIsLoading(true);
      const secretDocRef = doc(db, "secrets", secretID);
      const secretSnap = await getDoc(secretDocRef);

      if (!secretSnap.exists()) {
        throw new Error("Invalid secretID: No matching secret document found.");
      }

      const { projectID } = secretSnap.data();
      if (!projectID) {
        throw new Error("Secret document does not contain a projectID.");
      }

      // Delete the project
      const projectDocRef = doc(db, "projects", projectID);
      await deleteDoc(projectDocRef);

      // Delete the secret
      await deleteDoc(secretDocRef);

      // Reset the secretID and project since it's deleted
      setSecretID(null);
      setProject(null);
      setProjectID(null);
      setLeads([]);

      console.log("Project and secret deleted successfully.");
      setIsLoading(false);
      return true;
    } catch (e) {
      console.error("Error deleting project: ", e);
      setIsLoading(false);
      return false;
    }
  };

  /**
   * Adds a new lead to the current project's leads subcollection.
   * @param {object} lead - The lead data to add.
   * @returns {Promise<string|null>} The ID of the new lead or null on error.
   */
  const addLead = async (lead) => {
    if (!projectID) {
      console.error("No projectID available. Cannot add lead.");
      return null;
    }

    try {
      setIsLoading(true);
      const leadsCollectionRef = collection(db, "projects", projectID, "leads");
      const leadRef = await addDoc(leadsCollectionRef, lead);
      const newLead = { id: leadRef.id, ...lead };
      setLeads((prev) => [...prev, newLead]);
      setIsLoading(false);
      return leadRef.id;
    } catch (error) {
      console.error("Error adding lead: ", error);
      setIsLoading(false);
      return null;
    }
  };

  /**
   * Updates an existing lead in the current project's leads subcollection.
   * @param {object} lead - The lead data, must include `id` of the lead to update.
   * @returns {Promise<boolean>} True if successful, false otherwise.
   */
  const updateLead = async (lead) => {
    if (!projectID) {
      console.error("No projectID available. Cannot update lead.");
      return false;
    }
    if (!lead.id) {
      console.error("No lead ID provided. Cannot update lead.");
      return false;
    }

    try {
      setIsLoading(true);
      const leadDocRef = doc(db, "projects", projectID, "leads", lead.id);
      await updateDoc(leadDocRef, lead);

      // Update local state
      setLeads((prev) =>
        prev.map((l) => (l.id === lead.id ? { ...l, ...lead } : l))
      );

      setIsLoading(false);
      console.log("Lead updated successfully.");
      return true;
    } catch (error) {
      console.error("Error updating lead:", error);
      setIsLoading(false);
      return false;
    }
  };

  /**
   * Deletes an existing lead from the current project's leads subcollection.
   * @param {object} lead - The lead data, must include `id` of the lead to delete.
   * @returns {Promise<boolean>} True if successful, false otherwise.
   */
  const deleteLead = async (lead) => {
    if (!projectID) {
      console.error("No projectID available. Cannot delete lead.");
      return false;
    }

    if (!lead.id) {
      console.error("No lead ID provided. Cannot delete lead.");
      return false;
    }

    try {
      setIsLoading(true);
      const leadDocRef = doc(db, "projects", projectID, "leads", lead.id);
      await deleteDoc(leadDocRef);

      // Update local state
      setLeads((prev) => prev.filter((l) => l.id !== lead.id));

      console.log("Lead deleted successfully.");
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error("Error deleting lead:", error);
      setIsLoading(false);
      return false;
    }
  };

  const value = {
    localID,
    projectID,
    isSecret: !!secretID,
    addProject,
    updateProject,
    deleteProject,
    project,
    isLoading,
    leads,
    addLead,
    updateLead,
    deleteLead,
  };

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
};
