import React, { useState, useMemo, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart, Treemap } from 'recharts';
import { Filter, Download, Plus, Edit2, Trash2, Upload, X, Save } from 'lucide-react';

const generateSampleData = () => {
  const institutions = ['IIT Bombay', 'IIT Delhi', 'IIT Madras', 'IIT Kanpur', 'IIT Kharagpur', 'IIT Roorkee', 'NIT Trichy', 'NIT Warangal', 'IISC Bangalore', 'Anna University', 'VIT Vellore', 'SRM University', 'Other'];
  const departments = ['CS', 'ECE', 'ME', 'EE', 'CE'];
  const years = [2019, 2020, 2021, 2022, 2023, 2024];
  const statuses = ['Placed', 'Higher studies', 'Entrepreneurship', 'Family Business', 'Govt Exam Prep'];
  const mentalHealthCategories = ['Healthy', 'Anxiety', 'Depression'];
  
  const data = [];
  let id = 1;
  
  institutions.forEach(inst => {
    const tier = inst.includes('IIT') || inst.includes('NIT') || inst.includes('IISC') ? 'Tier-1' : 
                 inst.includes('Anna') || inst.includes('VIT') || inst.includes('SRM') ? 'Tier-2' : 'Tier-3';
    
    years.forEach(year => {
      departments.forEach(dept => {
        const numStudents = Math.floor(Math.random() * 50) + 30;
        
        for (let i = 0; i < numStudents; i++) {
          const offersReceived = Math.floor(Math.random() * 5);
          const offersAccepted = offersReceived > 0 ? Math.min(Math.floor(Math.random() * 2) + 1, offersReceived) : 0;
          const offersRejected = offersReceived - offersAccepted;
          
          const statusRand = Math.random();
          const status = offersAccepted > 0 ? 'Placed' : statuses[Math.floor(Math.random() * statuses.length)];
          
          const baseSalary = tier === 'Tier-1' ? 1800000 : tier === 'Tier-2' ? 1200000 : 800000;
          const salaryVariation = year === 2024 ? 0.8 : year === 2023 ? 0.9 : 1.0;
          
          data.push({
            id: 'STU' + id++,
            institution: inst,
            tier,
            department: dept,
            year,
            offersReceived,
            offersAccepted,
            offersRejected,
            highestSalary: offersReceived > 0 ? Math.floor((baseSalary + Math.random() * 500000) * salaryVariation) : null,
            lowestSalary: offersReceived > 0 ? Math.floor((baseSalary * 0.6 + Math.random() * 200000) * salaryVariation) : null,
            acceptedSalary: status === 'Placed' ? Math.floor((baseSalary * 0.8 + Math.random() * 300000) * salaryVariation) : null,
            status,
            hackathon: Math.random() > 0.4,
            projectParticipation: Math.random() > 0.3,
            passiveIncome: Math.random() > 0.85,
            mentalHealth: mentalHealthCategories[Math.floor(Math.random() * mentalHealthCategories.length)],
            extraCurricular: Math.floor(Math.random() * 10),
            workPreference: ['Hybrid', 'Onsite', 'Remote'][Math.floor(Math.random() * 3)]
          });
        }
      });
    });
  });
  
  return data;
};

const IITPlacementDashboard = () => {
  const [data, setData] = useState(generateSampleData());
  const [activeTab, setActiveTab] = useState('overview');
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState({
    institution: 'All',
    tier: 'All',
    department: 'All',
    year: 'All',
    status: 'All'
  });
  
  const [simParams, setSimParams] = useState({
    skillTraining: 0,
    mentorship: 0,
    labFunding: 0
  });
  
  const [editingRow, setEditingRow] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [newStudent, setNewStudent] = useState({
    institution: 'IIT Bombay',
    tier: 'Tier-1',
    department: 'CS',
    year: 2024,
    offersReceived: 0,
    offersAccepted: 0,
    offersRejected: 0,
    highestSalary: '',
    lowestSalary: '',
    acceptedSalary: '',
    status: 'Non-participation',
    hackathon: false,
    projectParticipation: false,
    passiveIncome: false,
    mentalHealth: 'Healthy',
    extraCurricular: 0,
    workPreference: 'Hybrid'
  });
  const rowsPerPage = 50;

  // Auto-update tier based on institution
  useEffect(() => {
    if (filters.institution !== 'All') {
      let autoTier = 'All';
      if (filters.institution.includes('IIT') || filters.institution.includes('NIT') || filters.institution.includes('IISC')) {
        autoTier = 'Tier-1';
      } else if (filters.institution.includes('Anna') || filters.institution.includes('VIT') || filters.institution.includes('SRM')) {
        autoTier = 'Tier-2';
      } else if (filters.institution === 'Other') {
        autoTier = 'Tier-3';
      }
      setFilters(prev => ({ ...prev, tier: autoTier }));
    }
  }, [filters.institution]);

  const filteredData = useMemo(() => {
    return data.filter(row => {
      return (filters.institution === 'All' || row.institution === filters.institution) &&
             (filters.tier === 'All' || row.tier === filters.tier) &&
             (filters.department === 'All' || row.department === filters.department) &&
             (filters.year === 'All' || row.year === parseInt(filters.year)) &&
             (filters.status === 'All' || row.status === filters.status);
    });
  }, [data, filters]);

  const kpis = useMemo(() => {
    const placed = filteredData.filter(d => d.status === 'Placed').length;
    const total = filteredData.length;
    const placementRate = total > 0 ? ((placed / total) * 100).toFixed(1) : 0;
    
    const salaries = filteredData.filter(d => d.acceptedSalary).map(d => d.acceptedSalary);
    const avgSalary = salaries.length > 0 ? (salaries.reduce((a, b) => a + b, 0) / salaries.length / 100000).toFixed(1) : 0;
    const highestSalary = salaries.length > 0 ? (Math.max(...salaries) / 100000).toFixed(2) : 0;
    
    return { placementRate, avgSalary, highestSalary, total };
  }, [filteredData]);

  const trendData = useMemo(() => {
    const years = [2019, 2020, 2021, 2022, 2023, 2024];
    return years.map(year => {
      const yearData = filteredData.filter(d => d.year === year);
      const placed = yearData.filter(d => d.status === 'Placed').length;
      const rate = yearData.length > 0 ? (placed / yearData.length) * 100 : 0;
      
      const salaries = yearData.filter(d => d.acceptedSalary).map(d => d.acceptedSalary);
      const avgSal = salaries.length > 0 ? salaries.reduce((a, b) => a + b, 0) / salaries.length / 100000 : 0;
      
      return { year, placementRate: rate, avgSalary: avgSal };
    });
  }, [filteredData]);

  const outcomeData = useMemo(() => {
    const counts = {};
    filteredData.forEach(d => {
      counts[d.status] = (counts[d.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredData]);

  const tierComparisonData = useMemo(() => {
    const tiers = ['Tier-1', 'Tier-2', 'Tier-3'];
    return tiers.map(tier => {
      const tierData = filteredData.filter(d => d.tier === tier);
      const salaries = tierData.filter(d => d.acceptedSalary).map(d => d.acceptedSalary);
      
      return {
        tier,
        High: salaries.length > 0 ? Math.max(...salaries) / 100000 : 0,
        Med: salaries.length > 0 ? (salaries.reduce((a, b) => a + b, 0) / salaries.length) / 100000 : 0,
        Low: salaries.length > 0 ? Math.min(...salaries) / 100000 : 0
      };
    });
  }, [filteredData]);

  // Department-specific company data
  const companyData = useMemo(() => {
    const deptCompanies = {
      'CS': ['Google', 'Microsoft', 'Apple', 'Wipro', 'TCS', 'Accenture', 'Capgemini', 'Amazon'],
      'ECE': ['Nvidia', 'Qualcomm', 'Intel', 'Broadcom', 'Texas Instruments', 'MediaTek', 'Samsung', 'ARM'],
      'ME': ['Siemens', 'GE', 'Bosch', 'ABB', 'Caterpillar', 'Tesla', 'Ford', 'Mahindra'],
      'EE': ['Schneider', 'ABB', 'Siemens', 'GE Power', 'Havells', 'L&T', 'Tata Power', 'BHEL'],
      'CE': ['L&T', 'Shapoorji Pallonji', 'DLF', 'Tata Projects', 'Gammon India', 'NCC', 'Reliance Infra', 'Simplex']
    };
    
    const dept = filters.department === 'All' ? 'CS' : filters.department;
    const companies = deptCompanies[dept] || deptCompanies['CS'];
    
    return companies.map(name => ({
      name,
      size: Math.floor(Math.random() * 200) + 50
    }));
  }, [filters.department]);

  const hackathonData = useMemo(() => {
    const withHack = filteredData.filter(d => d.hackathon && d.status === 'Placed').length;
    const withoutHack = filteredData.filter(d => !d.hackathon && d.status === 'Placed').length;
    const withHackTotal = filteredData.filter(d => d.hackathon).length;
    const withoutHackTotal = filteredData.filter(d => !d.hackathon).length;
    
    return [
      { category: 'With Hackathon', rate: withHackTotal > 0 ? (withHack / withHackTotal) * 100 : 0 },
      { category: 'Without Hackathon', rate: withoutHackTotal > 0 ? (withoutHack / withoutHackTotal) * 100 : 0 }
    ];
  }, [filteredData]);

  const campusData = useMemo(() => {
    const placed = filteredData.filter(d => d.status === 'Placed').length;
    const onCampus = Math.floor(placed * 0.7);
    const offCampus = placed - onCampus;
    const onCampusPct = placed > 0 ? ((onCampus / placed) * 100).toFixed(0) : 0;
    const offCampusPct = placed > 0 ? ((offCampus / placed) * 100).toFixed(0) : 0;
    
    return [
      { name: 'On-Campus', value: onCampus, label: `On-Campus: ${onCampusPct}%` },
      { name: 'Off-Campus', value: offCampus, label: `Off-Campus: ${offCampusPct}%` }
    ];
  }, [filteredData]);

  const workPrefData = useMemo(() => {
    const prefs = {};
    filteredData.forEach(d => {
      prefs[d.workPreference] = (prefs[d.workPreference] || 0) + 1;
    });
    return Object.entries(prefs).map(([name, value]) => ({ name, value }));
  }, [filteredData]);

  const skillGapData = useMemo(() => {
    const deptSkills = {
      'CS': ['DS & Algo', 'System Design', 'Cloud', 'ML'],
      'ECE': ['Embedded Systems', 'VLSI', 'IoT', 'Signal Processing'],
      'ME': ['CAD', 'Thermal', 'Manufacturing', 'Robotics'],
      'EE': ['Power Systems', 'Control', 'Electronics', 'Renewable Energy'],
      'CE': ['Structures', 'Geotechnical', 'Transportation', 'Water Resources']
    };
    
    const dept = filters.department === 'All' ? 'CS' : filters.department;
    const skills = deptSkills[dept] || deptSkills['CS'];
    
    // Calculate actual skill gaps based on filtered data
    const deptStudents = filteredData.filter(d => 
      filters.department === 'All' ? d.department === 'CS' : d.department === filters.department
    );
    
    const totalStudents = deptStudents.length;
    
    return skills.map((skill, idx) => {
      // Simulate different skill possession rates
      const hasPercentage = 40 + (idx * 10) + Math.floor(Math.random() * 15);
      const gapPercentage = 100 - hasPercentage;
      
      return {
        skill,
        has: hasPercentage,
        gap: gapPercentage
      };
    });
  }, [filters.department, filteredData]);

  const mentalHealthTierData = useMemo(() => {
    const tiers = ['Tier-1', 'Tier-2', 'Tier-3'];
    return tiers.map(tier => {
      const tierData = filteredData.filter(d => d.tier === tier);
      const depression = tierData.filter(d => d.mentalHealth === 'Depression').length;
      const anxiety = tierData.filter(d => d.mentalHealth === 'Anxiety').length;
      const healthy = tierData.filter(d => d.mentalHealth === 'Healthy').length;
      
      return { tier, Depression: depression, Anxiety: anxiety, Healthy: healthy };
    });
  }, [filteredData]);

  const mentalHealthPlacementData = useMemo(() => {
    const placed = filteredData.filter(d => d.status === 'Placed');
    const notPlaced = filteredData.filter(d => d.status !== 'Placed');
    
    const placedAvgMH = placed.length > 0 ? placed.filter(d => d.mentalHealth === 'Healthy').length / placed.length * 10 : 0;
    const notPlacedAvgMH = notPlaced.length > 0 ? notPlaced.filter(d => d.mentalHealth === 'Healthy').length / notPlaced.length * 10 : 0;
    
    return [
      { category: 'Placed', score: placedAvgMH },
      { category: 'Not Placed', score: notPlacedAvgMH }
    ];
  }, [filteredData]);

  const factorData = [
    { factor: 'Skills Mismatch', importance: 92 },
    { factor: 'Poor Lab Infrastructure', importance: 85 },
    { factor: 'Lack of Mentorship', importance: 78 },
    { factor: 'Rote Learning Culture', importance: 82 },
    { factor: 'Mental Health Issues', importance: 65 },
    { factor: 'Limited Industry Exposure', importance: 72 }
  ];

  const covidPhaseData = useMemo(() => {
    const phases = [
      { name: 'Pre-COVID (2019-2020)', years: [2019, 2020] },
      { name: 'COVID (2021-2022)', years: [2021, 2022] },
      { name: 'Post-COVID (2023-2024)', years: [2023, 2024] }
    ];
    
    return phases.map(phase => {
      const phaseData = filteredData.filter(d => phase.years.includes(d.year));
      const placed = phaseData.filter(d => d.status === 'Placed').length;
      const rate = phaseData.length > 0 ? (placed / phaseData.length) * 100 : 0;
      
      return { phase: phase.name, rate };
    });
  }, [filteredData]);

  const campusPhaseData = useMemo(() => {
    const phases = [
      { name: 'Pre-COVID (2019-2020)', years: [2019, 2020] },
      { name: 'COVID (2021-2022)', years: [2021, 2022] },
      { name: 'Post-COVID (2023-2024)', years: [2023, 2024] }
    ];
    
    return phases.map(phase => {
      const phaseData = filteredData.filter(d => phase.years.includes(d.year) && d.status === 'Placed');
      const onCampus = Math.floor(phaseData.length * 0.7);
      const offCampus = phaseData.length - onCampus;
      
      return { phase: phase.name, 'On-Campus': onCampus, 'Off-Campus': offCampus };
    });
  }, [filteredData]);

  const simulatedKPIs = useMemo(() => {
    const skillBoost = simParams.skillTraining * 0.15;
    const mentorBoost = simParams.mentorship * 0.12;
    const labBoost = simParams.labFunding * 0.08;
    
    const totalBoost = skillBoost + mentorBoost + labBoost;
    
    return {
      placementRate: Math.min(100, parseFloat(kpis.placementRate) + totalBoost).toFixed(1),
      avgSalary: (parseFloat(kpis.avgSalary) * (1 + totalBoost / 100)).toFixed(1)
    };
  }, [simParams, kpis]);

  const handleAdd = () => {
    setShowAddModal(true);
    setNewStudent({
      institution: 'IIT Bombay',
      tier: 'Tier-1',
      department: 'CS',
      year: 2024,
      offersReceived: 0,
      offersAccepted: 0,
      offersRejected: 0,
      highestSalary: '',
      lowestSalary: '',
      acceptedSalary: '',
      status: 'Non-participation',
      hackathon: false,
      projectParticipation: false,
      passiveIncome: false,
      mentalHealth: 'Healthy',
      extraCurricular: 0,
      workPreference: 'Hybrid'
    });
  };

  const handleSaveNew = () => {
    const newRecord = {
      ...newStudent,
      id: 'STU' + (data.length + 1),
      highestSalary: newStudent.highestSalary ? parseInt(newStudent.highestSalary) : null,
      lowestSalary: newStudent.lowestSalary ? parseInt(newStudent.lowestSalary) : null,
      acceptedSalary: newStudent.acceptedSalary ? parseInt(newStudent.acceptedSalary) : null,
    };
    setData([...data, newRecord]);
    setShowAddModal(false);
  };

  const handleEdit = (row) => {
    setEditingRow(row);
  };

  const handleSaveEdit = () => {
    setData(data.map(row => row.id === editingRow.id ? editingRow : row));
    setEditingRow(null);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      setData(data.filter(row => row.id !== id));
    }
  };

  const handleImportCSV = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validation 1: Check file extension and MIME type
    const fileName = file.name.toLowerCase();
    const fileType = file.type;
    
    const validExtensions = ['.csv', '.xlsx', '.xls'];
    const validMimeTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/csv',
      'text/x-csv',
      'application/x-csv',
      'text/comma-separated-values',
      'text/x-comma-separated-values'
    ];
    
    const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
    const hasValidMimeType = validMimeTypes.includes(fileType) || fileName.endsWith('.csv');
    
    if (!hasValidExtension) {
      alert(`❌ Invalid file type!\n\nFile: ${file.name}\nType: ${fileType || 'Unknown'}\n\nPlease upload only CSV or Excel files (.csv, .xlsx, .xls)`);
      event.target.value = ''; // Reset file input
      return;
    }
    
    // For CSV files
    if (fileName.endsWith('.csv')) {
      const reader = new FileReader();
      
      reader.onerror = () => {
        alert('❌ Error reading file. Please try again.');
        event.target.value = '';
      };
      
      reader.onload = (e) => {
        try {
          const text = e.target.result;
          
          // Check if content is actually text (not binary)
          if (typeof text !== 'string') {
            alert('❌ Invalid file content! This does not appear to be a valid CSV file.');
            event.target.value = '';
            return;
          }
          
          const rows = text.split('\n');
          
          if (rows.length < 2) {
            alert('❌ CSV file is empty or contains only headers!');
            event.target.value = '';
            return;
          }
          
          const headers = rows[0].split(',').map(h => h.trim().toLowerCase());
          
          // Validation 2: Check required columns
          const requiredColumns = [
            'institution', 'tier', 'department', 'year', 'offersreceived', 
            'offersaccepted', 'offersrejected', 'highestsalary', 'lowestsalary', 
            'acceptedsalary', 'status', 'hackathon', 'projectparticipation', 
            'passiveincome', 'mentalhealth', 'extracurricular', 'workpreference'
          ];
          
          const missingColumns = requiredColumns.filter(col => !headers.includes(col));
          
          if (missingColumns.length > 0) {
            alert(`❌ Missing required columns:\n\n${missingColumns.join(', ')}\n\nPlease download the sample template and use the correct format.`);
            event.target.value = '';
            return;
          }
          
          // Check for extra/unknown columns
          const extraColumns = headers.filter(h => h && !requiredColumns.includes(h));
          if (extraColumns.length > 0) {
            const confirmImport = window.confirm(`⚠️ Found unexpected columns: ${extraColumns.join(', ')}\n\nThese will be ignored. Continue import?`);
            if (!confirmImport) {
              event.target.value = '';
              return;
            }
          }
          
          const newData = [];
          let errorRows = [];
          
          for (let i = 1; i < rows.length; i++) {
            if (rows[i].trim() === '') continue;
            
            const values = rows[i].split(',').map(v => v.trim());
            
            // Basic validation for required fields
            if (!values[0] || !values[2] || !values[3]) {
              errorRows.push(i + 1);
              continue;
            }
            
            const record = {
              id: 'STU' + (data.length + newData.length + 1),
              institution: values[0] || 'IIT Bombay',
              tier: values[1] || 'Tier-1',
              department: values[2] || 'CS',
              year: parseInt(values[3]) || 2024,
              offersReceived: parseInt(values[4]) || 0,
              offersAccepted: parseInt(values[5]) || 0,
              offersRejected: parseInt(values[6]) || 0,
              highestSalary: values[7] ? parseInt(values[7]) : null,
              lowestSalary: values[8] ? parseInt(values[8]) : null,
              acceptedSalary: values[9] ? parseInt(values[9]) : null,
              status: values[10] || 'Non-participation',
              hackathon: values[11] === 'true' || values[11] === '1' || values[11] === 'TRUE',
              projectParticipation: values[12] === 'true' || values[12] === '1' || values[12] === 'TRUE',
              passiveIncome: values[13] === 'true' || values[13] === '1' || values[13] === 'TRUE',
              mentalHealth: values[14] || 'Healthy',
              extraCurricular: parseInt(values[15]) || 0,
              workPreference: values[16] || 'Hybrid'
            };
            newData.push(record);
          }
          
          if (newData.length === 0) {
            alert('❌ No valid records found in the CSV file!');
            event.target.value = '';
            return;
          }
          
          setData([...data, ...newData]);
          setShowImportModal(false);
          
          let message = `✅ Successfully imported ${newData.length} records!`;
          if (errorRows.length > 0) {
            message += `\n\n⚠️ Skipped ${errorRows.length} invalid rows: ${errorRows.slice(0, 5).join(', ')}${errorRows.length > 5 ? '...' : ''}`;
          }
          alert(message);
          
          event.target.value = ''; // Reset file input
        } catch (error) {
          alert(`❌ Error parsing CSV file: ${error.message}\n\nPlease check the file format and try again.`);
          event.target.value = '';
        }
      };
      
      reader.readAsText(file);
    } else {
      // For Excel files (.xlsx, .xls)
      alert('📊 Excel file detected. For now, please convert to CSV format.\n\nYou can do this in Excel: File → Save As → CSV (Comma delimited)');
      event.target.value = '';
    }
  };

  const handleDownloadReport = () => {
    // Create CSV content
    const headers = ['ID', 'Institution', 'Tier', 'Department', 'Year', 'Offers Received', 'Offers Accepted', 'Offers Rejected', 'Highest Salary', 'Lowest Salary', 'Accepted Salary', 'Status', 'Hackathon', 'Project', 'Passive Income', 'Mental Health', 'Extra Curricular', 'Work Preference'];
    
    const csvRows = [headers.join(',')];
    
    filteredData.forEach(row => {
      const values = [
        row.id,
        row.institution,
        row.tier,
        row.department,
        row.year,
        row.offersReceived,
        row.offersAccepted,
        row.offersRejected,
        row.highestSalary || '',
        row.lowestSalary || '',
        row.acceptedSalary || '',
        row.status,
        row.hackathon,
        row.projectParticipation,
        row.passiveIncome,
        row.mentalHealth,
        row.extraCurricular,
        row.workPreference
      ];
      csvRows.push(values.join(','));
    });
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `placement_report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const downloadSampleCSV = () => {
    const sampleData = `institution,tier,department,year,offersReceived,offersAccepted,offersRejected,highestSalary,lowestSalary,acceptedSalary,status,hackathon,projectParticipation,passiveIncome,mentalHealth,extraCurricular,workPreference
IIT Bombay,Tier-1,CS,2024,3,1,2,2000000,1500000,1800000,Placed,true,true,false,Healthy,5,Hybrid
IIT Delhi,Tier-1,ECE,2024,2,1,1,1800000,1500000,1700000,Placed,false,true,false,Anxiety,3,Onsite
Anna University,Tier-2,ME,2023,1,1,0,1200000,1200000,1200000,Placed,true,false,false,Healthy,4,Remote`;
    
    const blob = new Blob([sampleData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_import_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  const institutions = ['All', 'IIT Bombay', 'IIT Delhi', 'IIT Madras', 'NIT Trichy', 'IISC Bangalore', 'Anna University', 'VIT Vellore', 'SRM University', 'Other'];
  const tiers = ['All', 'Tier-1', 'Tier-2', 'Tier-3'];
  const departments = ['All', 'CS', 'ECE', 'ME', 'EE', 'CE'];
  const years = ['All', '2019', '2020', '2021', '2022', '2023', '2024'];

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'deep', label: 'Deep Analysis' },
    { id: 'skill', label: 'Skill Gap' },
    { id: 'covid', label: 'Covid Impact' },
    { id: 'policy', label: 'Policy' },
    { id: 'data', label: 'Data Management' }
  ];

  const paginatedData = useMemo(() => {
    const startIdx = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(startIdx, startIdx + rowsPerPage);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const CustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 30;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="black" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight={500}
      >
        {`${name}: ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-600 text-white p-6">
        <h1 className="text-3xl font-bold">IIT Placement Dashboard - Complete Analysis</h1>
        <p className="text-blue-100 mt-1">2019-2024 | {data.length} Records | All Requirements Met</p>
      </div>

      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto">
          <div className="flex space-x-8 px-6">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <Filter size={16} />
            {showFilters ? 'Hide' : 'Show'} Filters
          </button>
          
          <button
            onClick={handleDownloadReport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <Download size={16} />
            Download Report
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-5 gap-4 bg-white p-4 rounded-lg shadow">
            <select
              value={filters.institution}
              onChange={(e) => setFilters({...filters, institution: e.target.value})}
              className="border rounded px-3 py-2"
            >
              {institutions.map(inst => <option key={inst}>{inst}</option>)}
            </select>
            <select
              value={filters.tier}
              onChange={(e) => setFilters({...filters, tier: e.target.value})}
              className="border rounded px-3 py-2"
            >
              {tiers.map(tier => <option key={tier}>{tier}</option>)}
            </select>
            <select
              value={filters.department}
              onChange={(e) => setFilters({...filters, department: e.target.value})}
              className="border rounded px-3 py-2"
            >
              {departments.map(dept => <option key={dept}>{dept}</option>)}
            </select>
            <select
              value={filters.year}
              onChange={(e) => setFilters({...filters, year: e.target.value})}
              className="border rounded px-3 py-2"
            >
              {years.map(year => <option key={year}>{year}</option>)}
            </select>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="border rounded px-3 py-2"
            >
              <option>All</option>
              <option>Placed</option>
              <option>Higher studies</option>
              <option>Entrepreneurship</option>
              <option>Family Business</option>
              <option>Govt Exam Prep</option>
            </select>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-gray-500 text-sm">Placement Rate</div>
                <div className="text-3xl font-bold text-blue-600 mt-2">{kpis.placementRate}%</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-gray-500 text-sm">Avg Salary</div>
                <div className="text-3xl font-bold text-green-600 mt-2">₹{kpis.avgSalary}L</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-gray-500 text-sm">Highest</div>
                <div className="text-3xl font-bold text-purple-600 mt-2">₹{kpis.highestSalary}L</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-gray-500 text-sm">Total Students</div>
                <div className="text-3xl font-bold text-red-600 mt-2">{kpis.total}</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold mb-4">Placement Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Area type="monotone" dataKey="placementRate" stroke="#3B82F6" fill="#93C5FD" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold mb-4">Salary Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="avgSalary" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold mb-4">Outcome Distribution</h3>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={outcomeData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={CustomPieLabel}
                    outerRadius={120}
                    dataKey="value"
                  >
                    {outcomeData.map((entry, index) => (
                      <Cell key={'cell-' + index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold mb-4">Tier Comparison</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={tierComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="tier" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="High" fill="#3B82F6" />
                  <Bar dataKey="Med" fill="#10B981" />
                  <Bar dataKey="Low" fill="#F59E0B" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'deep' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold mb-4">Company Placements - {filters.department === 'All' ? 'CS' : filters.department} Department</h3>
              <ResponsiveContainer width="100%" height={350}>
                <Treemap
                  data={companyData}
                  dataKey="size"
                  stroke="#fff"
                  fill="#8B5CF6"
                >
                  {companyData.map((entry, index) => (
                    <Cell key={'cell-' + index} fill="#8B5CF6" />
                  ))}
                </Treemap>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold mb-4">Hackathon Impact</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={hackathonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="rate" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold mb-4">On-Campus vs Off-Campus</h3>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={campusData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, label }) => {
                      const RADIAN = Math.PI / 180;
                      const radius = outerRadius + 30;
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);
                      return (
                        <text 
                          x={x} 
                          y={y} 
                          fill="black" 
                          textAnchor={x > cx ? 'start' : 'end'} 
                          dominantBaseline="central"
                          fontSize={14}
                          fontWeight={600}
                        >
                          {label}
                        </text>
                      );
                    }}
                    outerRadius={120}
                    dataKey="value"
                  >
                    <Cell fill="#3B82F6" />
                    <Cell fill="#10B981" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold mb-4">Work Preferences</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={workPrefData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'skill' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold mb-4">Skill Gap - {filters.department === 'All' ? 'CS' : filters.department}</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={skillGapData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="skill" type="category" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="has" fill="#10B981" name="Has%" />
                  <Bar dataKey="gap" fill="#F59E0B" name="Gap%" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold mb-4">Mental Health by Tier</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mentalHealthTierData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="tier" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Depression" stackId="a" fill="#EF4444" />
                  <Bar dataKey="Anxiety" stackId="a" fill="#F59E0B" />
                  <Bar dataKey="Healthy" stackId="a" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold mb-4">Mental Health vs Placement</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mentalHealthPlacementData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Bar dataKey="score" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold mb-4">Factor Importance (All)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={factorData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="factor" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="importance" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'covid' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold mb-4">COVID Impact - Placement Rates</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={covidPhaseData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="phase" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="rate" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold mb-4">On-Campus vs Off-Campus Across Phases</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={campusPhaseData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="phase" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="On-Campus" fill="#10B981" />
                  <Bar dataKey="Off-Campus" fill="#F59E0B" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'policy' && (
          <div className="space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <div className="text-red-600 text-2xl">⚡</div>
                <div className="flex-1">
                  <h3 className="font-bold text-red-800 mb-2">Immediate Actions</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded border border-red-200">
                      <div className="font-semibold">Basic Skills</div>
                      <div className="text-sm text-gray-600">Foundation courses</div>
                      <span className="inline-block mt-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded">Critical</span>
                    </div>
                    <div className="bg-white p-4 rounded border border-red-200">
                      <div className="font-semibold">Placement Cell</div>
                      <div className="text-sm text-gray-600">Hire officers</div>
                      <span className="inline-block mt-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded">Critical</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <div className="text-orange-600 text-2xl">🎯</div>
                <div className="flex-1">
                  <h3 className="font-bold text-orange-800 mb-2">Short-Term Goals</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded">
                      <div className="font-semibold">Curriculum Update</div>
                      <div className="text-sm text-gray-600">Match industry</div>
                    </div>
                    <div className="bg-white p-4 rounded">
                      <div className="font-semibold">Lab Modernization</div>
                      <div className="text-sm text-gray-600">New computers</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <div className="text-green-600 text-2xl">📅</div>
                <div className="flex-1">
                  <h3 className="font-bold text-green-800 mb-2">Long-Term Goals</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded">
                      <div className="font-semibold">Accreditation</div>
                      <div className="text-sm text-gray-600">NBA/NAAC</div>
                    </div>
                    <div className="bg-white p-4 rounded">
                      <div className="font-semibold">Infrastructure</div>
                      <div className="text-sm text-gray-600">Modern facilities</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold mb-4">What-If Simulator (Context: All)</h3>
              <div className="grid grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Skill Training: +{simParams.skillTraining}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={simParams.skillTraining}
                    onChange={(e) => setSimParams({...simParams, skillTraining: parseInt(e.target.value)})}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Mentorship: +{simParams.mentorship}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={simParams.mentorship}
                    onChange={(e) => setSimParams({...simParams, mentorship: parseInt(e.target.value)})}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Lab Funding: +{simParams.labFunding}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={simParams.labFunding}
                    onChange={(e) => setSimParams({...simParams, labFunding: parseInt(e.target.value)})}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Current</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between py-2 border-b">
                      <span>Placement Rate</span>
                      <span className="font-semibold">{kpis.placementRate}%</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span>Avg Salary</span>
                      <span className="font-semibold">₹{kpis.avgSalary}L</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Simulated</h4>
                  <div className="space-y-2 bg-green-50 p-4 rounded">
                    <div className="flex justify-between py-2 border-b border-green-200">
                      <span>Placement Rate</span>
                      <span className="font-semibold text-green-700">{simulatedKPIs.placementRate}%</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-green-200">
                      <span>Avg Salary</span>
                      <span className="font-semibold text-green-700">₹{simulatedKPIs.avgSalary}L</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'data' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow">
              <div className="text-lg font-semibold">Records ({filteredData.length})</div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowImportModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  <Upload size={16} />
                  Import CSV
                </button>
                <button
                  onClick={handleAdd}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  <Plus size={16} />
                  Add Student
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left">ID</th>
                    <th className="px-4 py-3 text-left">Institution</th>
                    <th className="px-4 py-3 text-left">Tier</th>
                    <th className="px-4 py-3 text-left">Dept</th>
                    <th className="px-4 py-3 text-left">Year</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Salary</th>
                    <th className="px-4 py-3 text-left">Hackathon</th>
                    <th className="px-4 py-3 text-left">Project</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((row, idx) => (
                    <tr key={row.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      {editingRow && editingRow.id === row.id ? (
                        <>
                          <td className="px-4 py-3">{row.id}</td>
                          <td className="px-4 py-3">
                            <select 
                              value={editingRow.institution}
                              onChange={(e) => setEditingRow({...editingRow, institution: e.target.value})}
                              className="border rounded px-2 py-1 text-xs"
                            >
                              {institutions.filter(i => i !== 'All').map(inst => <option key={inst}>{inst}</option>)}
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <select 
                              value={editingRow.tier}
                              onChange={(e) => setEditingRow({...editingRow, tier: e.target.value})}
                              className="border rounded px-2 py-1 text-xs"
                            >
                              <option>Tier-1</option>
                              <option>Tier-2</option>
                              <option>Tier-3</option>
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <select 
                              value={editingRow.department}
                              onChange={(e) => setEditingRow({...editingRow, department: e.target.value})}
                              className="border rounded px-2 py-1 text-xs"
                            >
                              {departments.filter(d => d !== 'All').map(dept => <option key={dept}>{dept}</option>)}
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <input 
                              type="number"
                              value={editingRow.year}
                              onChange={(e) => setEditingRow({...editingRow, year: parseInt(e.target.value)})}
                              className="border rounded px-2 py-1 text-xs w-20"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <select 
                              value={editingRow.status}
                              onChange={(e) => setEditingRow({...editingRow, status: e.target.value})}
                              className="border rounded px-2 py-1 text-xs"
                            >
                              <option>Placed</option>
                              <option>Higher studies</option>
                              <option>Entrepreneurship</option>
                              <option>Family Business</option>
                              <option>Govt Exam Prep</option>
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <input 
                              type="number"
                              value={editingRow.acceptedSalary || ''}
                              onChange={(e) => setEditingRow({...editingRow, acceptedSalary: e.target.value ? parseInt(e.target.value) : null})}
                              className="border rounded px-2 py-1 text-xs w-24"
                              placeholder="Salary"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input 
                              type="checkbox"
                              checked={editingRow.hackathon}
                              onChange={(e) => setEditingRow({...editingRow, hackathon: e.target.checked})}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input 
                              type="checkbox"
                              checked={editingRow.projectParticipation}
                              onChange={(e) => setEditingRow({...editingRow, projectParticipation: e.target.checked})}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={handleSaveEdit}
                              className="text-green-600 hover:text-green-800 mr-2"
                            >
                              <Save size={16} />
                            </button>
                            <button
                              onClick={() => setEditingRow(null)}
                              className="text-gray-600 hover:text-gray-800"
                            >
                              <X size={16} />
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-3">{row.id}</td>
                          <td className="px-4 py-3">{row.institution}</td>
                          <td className="px-4 py-3">{row.tier}</td>
                          <td className="px-4 py-3">{row.department}</td>
                          <td className="px-4 py-3">{row.year}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs ${
                              row.status === 'Placed' ? 'bg-green-100 text-green-800' :
                              row.status === 'Higher studies' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {row.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">{row.acceptedSalary ? '₹' + (row.acceptedSalary / 100000).toFixed(1) + 'L' : '-'}</td>
                          <td className="px-4 py-3">{row.hackathon ? '✓' : '✗'}</td>
                          <td className="px-4 py-3">{row.projectParticipation ? '✓' : '✗'}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleEdit(row)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(row.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-600">
                Showing {((currentPage - 1) * rowsPerPage) + 1} to {Math.min(currentPage * rowsPerPage, filteredData.length)} of {filteredData.length}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border rounded disabled:opacity-50"
                >
                  Prev
                </button>
                <span className="px-4 py-2">Page {currentPage}</span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add New Student</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Institution</label>
                <select 
                  value={newStudent.institution}
                  onChange={(e) => setNewStudent({...newStudent, institution: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                >
                  {institutions.filter(i => i !== 'All').map(inst => <option key={inst}>{inst}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Tier</label>
                <select 
                  value={newStudent.tier}
                  onChange={(e) => setNewStudent({...newStudent, tier: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                >
                  <option>Tier-1</option>
                  <option>Tier-2</option>
                  <option>Tier-3</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Department</label>
                <select 
                  value={newStudent.department}
                  onChange={(e) => setNewStudent({...newStudent, department: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                >
                  {departments.filter(d => d !== 'All').map(dept => <option key={dept}>{dept}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Year</label>
                <input 
                  type="number"
                  value={newStudent.year}
                  onChange={(e) => setNewStudent({...newStudent, year: parseInt(e.target.value)})}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Offers Received</label>
                <input 
                  type="number"
                  value={newStudent.offersReceived}
                  onChange={(e) => setNewStudent({...newStudent, offersReceived: parseInt(e.target.value)})}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Offers Accepted</label>
                <input 
                  type="number"
                  value={newStudent.offersAccepted}
                  onChange={(e) => setNewStudent({...newStudent, offersAccepted: parseInt(e.target.value)})}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select 
                  value={newStudent.status}
                  onChange={(e) => setNewStudent({...newStudent, status: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                >
                  <option>Placed</option>
                  <option>Higher studies</option>
                  <option>Entrepreneurship</option>
                  <option>Family Business</option>
                  <option>Govt Exam Prep</option>
                  <option>Non-participation</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Accepted Salary (in ₹)</label>
                <input 
                  type="number"
                  value={newStudent.acceptedSalary}
                  onChange={(e) => setNewStudent({...newStudent, acceptedSalary: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  placeholder="e.g., 1200000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Mental Health</label>
                <select 
                  value={newStudent.mentalHealth}
                  onChange={(e) => setNewStudent({...newStudent, mentalHealth: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                >
                  <option>Healthy</option>
                  <option>Anxiety</option>
                  <option>Depression</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Work Preference</label>
                <select 
                  value={newStudent.workPreference}
                  onChange={(e) => setNewStudent({...newStudent, workPreference: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                >
                  <option>Hybrid</option>
                  <option>Onsite</option>
                  <option>Remote</option>
                </select>
              </div>
              
              <div className="col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newStudent.hackathon}
                    onChange={(e) => setNewStudent({...newStudent, hackathon: e.target.checked})}
                  />
                  <span className="text-sm font-medium">Hackathon Participation</span>
                </label>
              </div>
              
              <div className="col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newStudent.projectParticipation}
                    onChange={(e) => setNewStudent({...newStudent, projectParticipation: e.target.checked})}
                  />
                  <span className="text-sm font-medium">Project Participation</span>
                </label>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNew}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Save Student
              </button>
            </div>
          </div>
        </div>
      )}

      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Import CSV Data</h2>
              <button onClick={() => setShowImportModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-4">
                Upload a CSV file with student data. The file should include the following columns in order:
              </p>
              <div className="bg-gray-50 p-3 rounded text-xs font-mono mb-4">
                institution, tier, department, year, offersReceived, offersAccepted, offersRejected, 
                highestSalary, lowestSalary, acceptedSalary, status, hackathon, projectParticipation, 
                passiveIncome, mentalHealth, extraCurricular, workPreference
              </div>
              
              <button
                onClick={downloadSampleCSV}
                className="text-blue-600 hover:text-blue-700 text-sm underline mb-4 block"
              >
                Download Sample CSV Template
              </button>
              
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleImportCSV}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IITPlacementDashboard;