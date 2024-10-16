import { React, useState, useEffect } from "react";
import "../../App.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { MultiSelect } from "react-multi-select-component";
import { State } from "country-state-city";
import axios from "axios";
import imageCompression from "browser-image-compression";

const states = State.getStatesOfCountry("IN");
const option = states.map((state) => ({ value: state.isoCode, label: state.name }));
const storedToken = localStorage.getItem("token");

const AddClient = () => {
    const [branches, setBranches] = useState([{ branchEmail: "", branchName: "" }]);

    const [accountOptions, setAccountOptions] = useState({
        clientSpocOptions: [],
        escalationManagerOptions: [],
        billingSpocOptions: [],
        billingEscalationOptions: [],
        authorizedPersonOptions: [],
    });

    const [fileName, setFileName] = useState("");
    const [apiError, setApiError] = useState("");
    const addBranch = () => {
        setBranches([...branches, { branchEmail: "", branchName: "" }]);
    };
    const removeBranch = (index) => {
        const newBranches = branches.filter((_, i) => i !== index);
        setBranches(newBranches);
    };
    const options = [
        { value: "option1", label: "Option 1" },
        { value: "option2", label: "Option 2" },
        { value: "option3", label: "Option 3" },
    ];
    const [clientData, setClientData] = useState({
        organizationName: "",
        clientId: "",
        registeredAddress: "",
        state: "",
        stateCode: "",
        gstNumber: "",
        tat: "",
        email: "",
        serviceAgreementDate: "",
        clientProcedure: "",
        agreementPeriod: "",
        customTemplate: "",
        clientLogo: "",
        accountManagement: "",
        scopeOfServices: "",
        pricingPackages: "",
        mobileNumber: "",
        role: "",
        standardProcess: "",
        clientSpoc: "",
        escalationManager: "",
        billingSpoc: "",
        billingEscalation: "",
        authorizedPerson: "",
        Branches: "",
    });

    const [date, setDate] = useState(null);
    const [selectedOption, setSelectedOption] = useState(null);
    const [selected, setSelected] = useState([]);
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};
        const requiredFields = ["organizationName", "clientId", "registeredAddress", "state", "gstNumber", "tat", "email", "customTemplate", "accountManagement", "mobileNumber", "standardProcess"];

        requiredFields.forEach((field) => {
            if (!clientData[field]) {
                newErrors[field] = "This field is required";
            }
        });

        if (clientData.gstNumber && clientData.gstNumber.length !== 15) {
            newErrors.gstNumber = "GST Number must be 15 characters";
        }

        if (clientData.mobileNumber && !/^\d{10}$/.test(clientData.mobileNumber)) {
            newErrors.mobileNumber = "Mobile Number must be 10 digits";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0; // Return true if no errors
    };
    const handleInputChange = (index, event) => {
        const { name, value } = event.target;
        const newBranches = [...branches];
        newBranches[index][name] = value;
        setBranches(newBranches);
    };
    const handleChange = (e) => {
      const { name, value, type, files } = e.target;
      
      Update the clientData state correctly
      setClientData((prevData) => ({
          ...prevData,
          [name]: type === "file" ? files[0] : value, 
      }));
  };
  
    useEffect(() => {
        const fetchAccountOptions = async () => {
            try {
                const config = {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${storedToken}`,
                    },
                };

                const clientSpocRes = await axios.get("https://screeningstar.onrender.com/Screeningstar/clientspoc", config);
                const escalationManagerRes = await axios.get("https://screeningstar.onrender.com/Screeningstar/escalationmanager", config);
                const billingSpocRes = await axios.get("https://screeningstar.onrender.com/Screeningstar/billingspoc", config);
                const billingEscalationRes = await axios.get("https://screeningstar.onrender.com/Screeningstar/billingescalation", config);
                const authorizedPersonRes = await axios.get("https://screeningstar.onrender.com/Screeningstar/authorizeddetails", config);

                setAccountOptions({
                    clientSpocOptions: clientSpocRes.data,
                    escalationManagerOptions: escalationManagerRes.data,
                    billingSpocOptions: billingSpocRes.data,
                    billingEscalationOptions: billingEscalationRes.data,
                    authorizedPersonOptions: authorizedPersonRes.data,
                });
            } catch (error) {
                console.error("Error fetching options", error);
            }
        };

        fetchAccountOptions();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError("");
        if (!validateForm()) return;

        let fileNameWithTimestamp = "";
        try {
            console.log("Branches:", branches);
            const options = {
                maxSizeMB: 1,
                useWebWorker: true,
                initialQuality: 1,
            };

            Compress the image
            const compressedFile = await imageCompression(clientData.clientLogo, options);

            Generate the timestamp for the file name
            const timestamp = Date.now();
            fileNameWithTimestamp = `${timestamp}_${compressedFile.name}`;

            Handle file upload (optional step) or just use the string format for the file name
        } catch (error) {
            console.error("Error compressing or uploading image:", error);
            setApiError("Failed to upload image.");
            return;
        }

        Convert packageOptions array to a string (e.g., separated by commas)
        const packageOptionsString = selected.map((item) => item.value).join(", ");

        Prepare the JSON payload
        const payload = {
            ...clientData,
            serviceAgreementDate: date, // Add the date
            packageOptions: packageOptionsString, // Send package options as a string
            loginRequired: selectedOption, // Add the selected login option
            clientLogo: fileNameWithTimestamp, // Send the client logo as a string
        };

        try {
            const response = await axios.post("https://screeningstar.onrender.com/Screeningstar/clients", payload, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${storedToken}`,
                },
            });

            console.log("Success:", response.data);
            setClientData({
                organizationName: "",
                clientId: "",
                registeredAddress: "",
                state: "",
                stateCode: "",
                gstNumber: "",
                tat: "",
                email: "",
                serviceAgreementDate: "",
                clientProcedure: "",
                agreementPeriod: "",
                customTemplate: "",
                clientLogo: "",
                accountManagement: "",
                scopeOfServices: "",
                pricingPackages: "",
                mobileNumber: "",
                role: "",
                standardProcess: "",
            });
            setApiError("");
            setSelected([]);
            setDate(null);
            setSelectedOption(null);
        } catch (error) {
            console.error("Error:", error);
            setApiError("There was an error submitting the form. Please try again.");
        }
    };

    return (
        <div className="w-full bg-[#f7f6fb] p-6">
            <div className="text-center mb-5 ">
                <h1 className="text-3xl font-bold mb-2">Add New Client</h1>
                <hr className="border-t-4 border-black w-[180px] -mt-2.5 mx-auto mb-4" />
            </div>

            <form className="space-y-4 py-[30px] px-[51px] bg-white rounded-md" onSubmit={handleSubmit}>
                {/* Organization Name */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block mb-1 text-sm font-medium">Name of the Organization</label>
                        <input
                            type="text"
                            name="organizationName"
                            placeholder="Enter Organization Name"
                            value={clientData.organizationName}
                            onChange={handleChange}
                            className={`w-full rounded-md p-2.5 mb-[20px] border ${errors.organizationName ? "border-red-500" : "border-gray-300"} bg-[#f7f6fb]`}
                        />
                        {errors.organizationName && <span className="text-red-500">{errors.organizationName}</span>}
                    </div>
                    <div>
                        <label className="block mb-1 text-sm font-medium">Client Unique ID</label>
                        <input
                            type="text"
                            name="clientId"
                            placeholder="Enter Client Unique ID"
                            value={clientData.clientId}
                            onChange={handleChange}
                            className={`w-full rounded-md p-2.5 mb-[20px] border ${errors.clientId ? "border-red-500" : "border-gray-300"} bg-[#f7f6fb]`}
                        />
                        {errors.clientId && <span className="text-red-500">{errors.clientId}</span>}
                    </div>
                </div>

                {/* Registered Address */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block mb-1 text-sm font-medium">Registered Address</label>
                        <input
                            type="text"
                            name="registeredAddress"
                            placeholder="Enter Registered Address"
                            value={clientData.registeredAddress}
                            onChange={handleChange}
                            className={`w-full rounded-md p-2.5 mb-[20px] border ${errors.registeredAddress ? "border-red-500" : "border-gray-300"} bg-[#f7f6fb]`}
                        />
                        {errors.registeredAddress && <span className="text-red-500">{errors.registeredAddress}</span>}
                    </div>
                    <div>
                        <label className="block mb-1 text-sm font-medium">State</label>
                        <div className="relative">
                            <select
                                name="state"
                                value={clientData.state || ""}
                                onChange={handleChange}
                                className={`w-full rounded-md p-2.5 mb-[20px] border ${errors.state ? "border-red-500" : "border-gray-300"} bg-[#f7f6fb] appearance-none pr-8`}
                            >
                                <option value="" className="text-[#989fb3]">
                                    Select State
                                </option>
                                {option.map((opt) => (
                                    <option key={opt.value} value={opt.value} className="text-black">
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                            {errors.state && <span className="text-red-500">{errors.state}</span>}
                        </div>
                    </div>
                </div>

                {/* State Code and GST Number */}
                <div className="grid mb-[30px] grid-cols-2 gap-4">
                    <div>
                        <label className="block mb-1 text-sm font-medium">State Code</label>
                        <input
                            type="text"
                            name="stateCode"
                            placeholder="Enter State Code"
                            value={clientData.stateCode}
                            onChange={handleChange}
                            className={`w-full rounded-md p-2.5 mb-[20px] border ${errors.stateCode ? "border-red-500" : "border-gray-300"} bg-[#f7f6fb]`}
                        />
                    </div>
                    <div>
                        <label className="block mb-1 text-sm font-medium">GST Number</label>
                        <input
                            type="text"
                            name="gstNumber"
                            placeholder="Enter GST Number"
                            value={clientData.gstNumber}
                            onChange={handleChange}
                            className={`w-full rounded-md p-2.5 mb-[20px] border ${errors.gstNumber ? "border-red-500" : "border-gray-300"} bg-[#f7f6fb]`}
                        />
                        {errors.gstNumber && <span className="text-red-500">{errors.gstNumber}</span>}
                    </div>
                </div>

                {/* Mobile Number and TAT */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block mb-1 text-sm font-medium">Mobile Number</label>
                        <input
                            type="text"
                            name="mobileNumber"
                            placeholder="Enter Mobile Number"
                            value={clientData.mobileNumber}
                            onChange={handleChange}
                            className={`w-full rounded-md p-2.5 mb-[20px] border ${errors.mobileNumber ? "border-red-500" : "border-gray-300"} bg-[#f7f6fb]`}
                        />
                        {errors.mobileNumber && <span className="text-red-500">{errors.mobileNumber}</span>}
                    </div>
                    <div>
                        <label className="block mb-1 text-sm font-medium">Email</label>
                        <input
                            type="text"
                            name="email"
                            placeholder="Enter Email"
                            value={clientData.email}
                            onChange={handleChange}
                            className={`w-full rounded-md p-2.5 mb-[20px] border ${errors.email ? "border-red-500" : "border-gray-300"} bg-[#f7f6fb]`}
                        />
                        {errors.email && <span className="text-red-500">{errors.email}</span>}
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block mb-1 text-sm font-medium">Service Agreement Date</label>
                        <DatePicker
                            selected={date}
                            onChange={(date) => setDate(date)}
                            placeholderText="Select Service Agreement Date"
                            className={`w-full rounded-md p-2.5 mb-[20px] border ${errors.serviceAgreementDate ? "border-red-500" : "border-gray-300"} bg-[#f7f6fb]`}
                        />
                    </div>
                    <div>
                        <label className="block mb-1 text-sm font-medium">TAT (Turnaround Time)</label>
                        <input
                            type="text"
                            name="tat"
                            placeholder="Enter TAT"
                            value={clientData.tat}
                            onChange={handleChange}
                            className={`w-full rounded-md p-2.5 mb-[20px] border ${errors.tat ? "border-red-500" : "border-gray-300"} bg-[#f7f6fb]`}
                        />
                        {errors.tat && <span className="text-red-500">{errors.tat}</span>}
                    </div>
                    <div>
                        <label className="block mb-1 text-sm font-medium">Custom Template</label>
                        <input
                            type="text"
                            name="customTemplate"
                            placeholder="Enter Custom Template"
                            value={clientData.customTemplate}
                            onChange={handleChange}
                            className={`w-full rounded-md p-2.5 mb-[20px] border ${errors.customTemplate ? "border-red-500" : "border-gray-300"} bg-[#f7f6fb]`}
                        />
                        {errors.customTemplate && <span className="text-red-500">{errors.customTemplate}</span>}
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block mb-1 text-sm font-medium">Client Procedure</label>
                        <input
                            type="text"
                            name="clientProcedure"
                            placeholder="Enter Client Procedure"
                            value={clientData.clientProcedure}
                            onChange={handleChange}
                            className={`w-full rounded-md p-2.5 mb-[20px] border ${errors.clientProcedure ? "border-red-500" : "border-gray-300"} bg-[#f7f6fb]`}
                        />
                    </div>
                    <div>
                        <label className="block mb-1 text-sm font-medium">Agreement Period</label>
                        <select
                            name="agreementPeriod"
                            value={clientData.agreementPeriod || ""}
                            onChange={handleChange}
                            className={`w-full rounded-md p-2.5 mb-[20px] border ${errors.agreementPeriod ? "border-red-500" : "border-gray-300"} bg-[#f7f6fb]`}
                        >
                            <option value="" className="text-[#989fb3]">
                                Select Agreement Period
                            </option>
                            <option value="1 Year">1 Year</option>
                            <option value="2 Years">2 Years</option>
                            <option value="3 Years">3 Years</option>
                            {/* Add more options as needed */}
                        </select>
                    </div>
                </div>

                {/* Account Management and Scope of Services */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block mb-1 text-sm font-medium">Account Management</label>
                        <input
                            type="text"
                            name="accountManagement"
                            placeholder="Enter Account Management"
                            value={clientData.accountManagement}
                            onChange={handleChange}
                            className={`w-full rounded-md p-2.5 mb-[20px] border ${errors.accountManagement ? "border-red-500" : "border-gray-300"} bg-[#f7f6fb]`}
                        />
                        {errors.accountManagement && <span className="text-red-500">{errors.accountManagement}</span>}
                    </div>
                    <div>
                        <label className="block mb-1 text-sm font-medium">Scope of Services</label>
                        <input
                            type="text"
                            name="scopeOfServices"
                            placeholder="Enter Scope of Services"
                            value={clientData.scopeOfServices}
                            onChange={handleChange}
                            className={`w-full rounded-md p-2.5 mb-[20px] border ${errors.scopeOfServices ? "border-red-500" : "border-gray-300"} bg-[#f7f6fb]`}
                        />
                        {errors.scopeOfServices && <span className="text-red-500">{errors.scopeOfServices}</span>}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block mb-1 text-sm font-medium">Pricing Packages</label>
                        <input
                            type="text"
                            name="pricingPackages"
                            placeholder="Enter Pricing Packages"
                            value={clientData.pricingPackages}
                            onChange={handleChange}
                            className={`w-full rounded-md p-2.5 mb-[20px] border ${errors.pricingPackages ? "border-red-500" : "border-gray-300"} bg-[#f7f6fb]`}
                        />
                        {errors.pricingPackages && <span className="text-red-500">{errors.pricingPackages}</span>}
                    </div>
                    <div>
                        <label className="block mb-1 text-sm font-medium">Client Logo</label>
                        <input type="file" name="clientLogo" onChange={handleChange} className="w-full rounded-md p-2.5 mb-[20px] border border-gray-300 bg-[#f7f6fb]" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block mb-1 text-sm font-medium">Select Packages</label>
                        <MultiSelect options={options} value={selected} onChange={setSelected} labelledBy="Select Packages" className="mb-[20px]" />
                    </div>
                    <div>
                        <label className="block mb-1 text-sm font-medium">Role</label>
                        <input type="text" name="role" onChange={handleChange} className="w-full rounded-md p-2.5 mb-[20px] border border-gray-300 bg-[#f7f6fb]" />
                        {errors.role && <span className="text-red-500">{errors.role}</span>}
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block mb-1 text-sm font-medium">Client Spoc</label>
                        <select name="clientSpoc" value={clientData.clientSpoc || ""} onChange={handleChange} className={`w-full rounded-md p-2.5 mb-[20px] border ${errors.clientSpoc ? "border-red-500" : "border-gray-300"} bg-[#f7f6fb]`}>
                            <option value="" className="text-[#989fb3]">
                                Select Client Spoc
                            </option>
                            {accountOptions.clientSpocOptions.map((option) => (
                                <option key={option.id} value={option.spocName}>
                                    {option.spocName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block mb-1 text-sm font-medium">Escalation Manager</label>
                        <select
                            name="escalationManager"
                            value={clientData.escalationManager || ""}
                            onChange={handleChange}
                            className={`w-full rounded-md p-2.5 mb-[20px] border ${errors.escalationManager ? "border-red-500" : "border-gray-300"} bg-[#f7f6fb]`}
                        >
                            <option value="" className="text-[#989fb3]">
                                Select Escalation Manager
                            </option>
                            {accountOptions.escalationManagerOptions.map((option) => (
                                <option key={option.id} value={option.escalationName}>
                                    {option.escalationName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block mb-1 text-sm font-medium">Billing Spoc</label>
                        <select
                            name="billingSpoc"
                            value={clientData.billingSpoc || ""}
                            onChange={handleChange}
                            className={`w-full rounded-md p-2.5 mb-[20px] border ${errors.billingSpoc ? "border-red-500" : "border-gray-300"} bg-[#f7f6fb]`}
                        >
                            <option value="" className="text-[#989fb3]">
                                Select Billing Spoc
                            </option>
                            {accountOptions.billingSpocOptions.map((option) => (
                                <option key={option.id} value={option.name}>
                                    {option.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block mb-1 text-sm font-medium">Billing Escalation</label>
                        <select
                            name="billingEscalation"
                            value={clientData.billingEscalation || ""}
                            onChange={handleChange}
                            className={`w-full rounded-md p-2.5 mb-[20px] border ${errors.billingEscalation ? "border-red-500" : "border-gray-300"} bg-[#f7f6fb]`}
                        >
                            <option value="" className="text-[#989fb3]">
                                Select Billing Escalation
                            </option>
                            {accountOptions.billingEscalationOptions.map((option) => (
                                <option key={option.id} value={option.name}>
                                    {option.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block mb-1 text-sm font-medium">Authorized Details</label>
                        <select
                            name="authorizedPerson"
                            value={clientData.authorizedPerson || ""}
                            onChange={handleChange}
                            className={`w-full rounded-md p-2.5 mb-[20px] border ${errors.authorizedPerson ? "border-red-500" : "border-gray-300"} bg-[#f7f6fb]`}
                        >
                            <option value="" className="text-[#989fb3]">
                                Select Authorized Details
                            </option>
                            {accountOptions.authorizedPersonOptions.map((option) => (
                                <option key={option.id} value={option.id}>
                                    {option.id}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block mb-1 text-sm font-medium">Login Required Option</label>
                        <select onChange={(e) => setSelectedOption(e.target.value)} className={`w-full rounded-md p-2.5 mb-[20px] border ${errors.loginRequired ? "border-red-500" : "border-gray-300"} bg-[#f7f6fb]`}>
                            <option value="">Login Required Option</option>
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                        </select>
                        {errors.loginRequired && <span className="text-red-500">{errors.loginRequired}</span>}
                    </div>

                    <div>
                        <label className="block mb-1 text-sm font-medium">Standard Process</label>
                        <input
                            type="text"
                            name="standardProcess"
                            placeholder="Enter Standard Process"
                            value={clientData.standardProcess}
                            onChange={handleChange}
                            className={`w-full rounded-md p-2.5 mb-[20px] border ${errors.standardProcess ? "border-red-500" : "border-gray-300"} bg-[#f7f6fb]`}
                        />
                        {errors.standardProcess && <span className="text-red-500">{errors.standardProcess}</span>}
                    </div>
                </div>
                <div className="">
                    {branches.map((branch, index) => (
                        <div key={index} className="mb-4 flex items-center w-1/2 grid-cols-2 gap-4">
                              <div className="w-1/2">
                                  <input
                                      type="email"
                                      name="branchEmail"
                                      value={branch.branchEmail}
                                      onChange={(event) => handleInputChange(index, event)}
                                      placeholder="Branch Email"
                                      className="border w-full rounded-md p-2.5 mb-[20px]"
                                      required
                                  />
                            </div>
                            <div className="flex w-1/2  gap-3 items-center">
                                <input type="text" name="branchName" value={branch.branchName} onChange={(event) => handleInputChange(index, event)} placeholder="Branch Name" className="border w-full rounded-md p-2.5 mb-[20px]" required />
                                <button type="button" onClick={() => removeBranch(index)} className="bg-red-500 text-white p-2.5 mb-[20px] rounded">
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}
                    <button type="button" onClick={addBranch} className="bg-green-700 text-white p-2 rounded">
                        Add Branch
                    </button>
                </div>

                <div className="text-center">
                    <button type="submit" className="bg-blue-500 text-white rounded-md px-4 py-2 hover:bg-blue-600 transition duration-200">
                        Submit
                    </button>
                    {apiError && <div className="text-red-500 mt-4">{apiError}</div>}
                </div>
            </form>
        </div>
    );
};

export default AddClient;
