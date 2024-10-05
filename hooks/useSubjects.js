
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from "@/context/AuthContext";
import { doc, setDoc, updateDoc, deleteField } from "firebase/firestore";
import { db } from "@/firebase";
import { useRouter } from 'next/navigation';

// calculates all accumulated stats for a subject
function calculateSubjectProgress(subject) {
    if (!subject || !subject.studyData) {
      return { progressPercentage: 0, totalStudyDays: 0, totalStudyHours: 0 };
    }
  
    const { targetHours, studyData } = subject;
    let totalStudyDays = 0;
    let totalStudyHours = 0;
  
    Object.values(studyData).forEach((year) => {
      Object.values(year).forEach((month) => {
        Object.values(month).forEach((hours) => {
          totalStudyDays++;
          totalStudyHours += hours;
        });
      });
    });
  
    const progressPercentage = targetHours > 0 ? (totalStudyHours / targetHours) * 100 : 0;
  
    return { progressPercentage, totalStudyDays, totalStudyHours };
  }
  
// functions to manage subject
export function useSubjects() {
  const { currentUser, userDataObj, setUserDataObj } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const router = useRouter()

  useEffect(() => {
    if (userDataObj && userDataObj.subjects) {
      setSubjects(Object.keys(userDataObj.subjects));
    }
  }, [userDataObj]);

  // memorize calculation, the subjectsProgress example {math: {progressPercentage, totalStudyDays, totalStudyHours}}
  const subjectsProgress = useMemo(() => {
    if (!userDataObj || !userDataObj.subjects) return {};

    return Object.entries(userDataObj.subjects).reduce((acc, [subjectName, subjectData]) => {
      acc[subjectName] = calculateSubjectProgress(subjectData);
      return acc;
    }, {});
  }, [userDataObj]);

  const addSubject = async (newSubject) => {
    try {
      if (subjects.includes(newSubject)) {
        throw new Error("Subject already exists");
      }
      const newSubjects = { ...userDataObj.subjects, 
        [newSubject]: { targetHours: 0, studyData: {} } 
      };
      const newUserData = { ...userDataObj, subjects: newSubjects };
      setUserDataObj(newUserData);
      const docRef = doc(db, "users", currentUser.uid);
      await setDoc(docRef, { subjects: newSubjects }, { merge: true });
      setSubjects(Object.keys(newSubjects));
    } catch (error) {
      console.error(`Failed to add subject: ${error.message}`);
      throw error;
    }
  };

  const deleteSubject = async (subject) => {
    try {
      const updatedSubjects = subjects.filter((sub) => sub !== subject);
      const newUserData = { ...userDataObj };
      delete newUserData.subjects[subject];
      setUserDataObj(newUserData);
      setSubjects(updatedSubjects);
      const docRef = doc(db, "users", currentUser.uid);
      await updateDoc(docRef, {
        [`subjects.${subject}`]: deleteField(),
      });
    } catch (error) {
      console.error(`Failed to delete subject: ${error.message}`);
      throw error;
    }
  };

  const selectSubject = (subject) => {
    router.push(`/dashboard?subject=${encodeURIComponent(subject)}`);
  }

  return { subjects, subjectsProgress, addSubject, deleteSubject, selectSubject };
}
