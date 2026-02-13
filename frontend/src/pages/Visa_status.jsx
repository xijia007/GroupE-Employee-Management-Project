import { useEffect, useState } from "react";
import VisaStatusManagementPage from "../components/form/Visa_StatusForm_.jsx";
import api from "../services/api";

function VisaStatusManagement() {
  const [isOPTUser, setIsOPTUser] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      try {
        const res = await api.get("/info/profile");
        if (cancelled) return;

        const visaType = res?.data?.visaInformation?.visaType || "";
        const normalized = String(visaType).toLowerCase();

        // Only F1(CPT/OPT) users should access the OPT upload flow.
        const isOpt = normalized.includes("f1");
        setIsOPTUser(isOpt);
      } catch {
        if (!cancelled) setIsOPTUser(false);
      }
    };

    loadProfile();
    return () => {
      cancelled = true;
    };
  }, []);

  return <VisaStatusManagementPage isOPTUser={isOPTUser} />;
}
export default VisaStatusManagement;
