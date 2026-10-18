import { Department, Employee } from '../types';

export const INITIAL_DEPARTMENTS: Department[] = [
  {
    DepartmentID: 'DEP-001',
    DepartmentName: 'Information Technology (IT)',
    Note: 'គ្រប់គ្រងប្រព័ន្ធ Software, Network & ហេដ្ឋារចនាសម្ព័ន្ធ IT'
  },
  {
    DepartmentID: 'DEP-002',
    DepartmentName: 'Human Resources (HR)',
    Note: 'គ្រប់គ្រងការជ្រើសរើសបុគ្គលិក, វប្បធម៌ស្ថាប័ន & បណ្តុះបណ្តាល'
  },
  {
    DepartmentID: 'DEP-003',
    DepartmentName: 'Accounting & Finance',
    Note: 'គ្រប់គ្រងហិរញ្ញវត្ថុ, គណនេយ្យ, បៀវត្សរ៍ & ថវិកាប្រចាំឆ្នាំ'
  },
  {
    DepartmentID: 'DEP-004',
    DepartmentName: 'Sales & Marketing',
    Note: 'ផ្សព្វផ្សាយពាណិជ្ជកម្ម, ស្វែងរកអតិថិជនថ្មី & រក្សាទំនាក់ទំនង'
  },
  {
    DepartmentID: 'DEP-005',
    DepartmentName: 'Operations & Logistics',
    Note: 'គ្រប់គ្រងប្រតិបត្តិការទូទៅ ការដឹកជញ្ជូន & ផ្គត់ផ្គង់'
  }
];

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    EmployeeID: 'EMP-1001',
    Name: 'Chen Sokha (ចិន សុខា)',
    Gender: 'Male',
    Phone: '012 345 678',
    Address: 'សង្កាត់ទួលទំពូង, ខណ្ឌចំការមន, រាជធានីភ្នំពេញ',
    DepartmentID: 'DEP-001'
  },
  {
    EmployeeID: 'EMP-1002',
    Name: 'Pich Bopha (ពេជ្រ បុប្ផា)',
    Gender: 'Female',
    Phone: '098 765 432',
    Address: 'សង្កាត់ស្វាយដង្គំ, ក្រុងសៀមរាប, ខេត្តសៀមរាប',
    DepartmentID: 'DEP-002'
  },
  {
    EmployeeID: 'EMP-1003',
    Name: 'Meas Vireak (មាស វីរៈ)',
    Gender: 'Male',
    Phone: '088 112 233',
    Address: 'សង្កាត់ស្វាយប៉ោ, ក្រុងបាត់ដំបង, ខេត្តបាត់ដំបង',
    DepartmentID: 'DEP-001'
  },
  {
    EmployeeID: 'EMP-1004',
    Name: 'Som Chanthy (សោម ចាន់ធី)',
    Gender: 'Female',
    Phone: '077 556 677',
    Address: 'សង្កាត់តាខ្មៅ, ក្រុងតាខ្មៅ, ខេត្តកណ្តាល',
    DepartmentID: 'DEP-003'
  },
  {
    EmployeeID: 'EMP-1005',
    Name: 'Keo Sovann (កែវ សុវណ្ណ)',
    Gender: 'Male',
    Phone: '092 334 455',
    Address: 'សង្កាត់ទឹកថ្លា, ខណ្ឌសែនសុខ, រាជធានីភ្នំពេញ',
    DepartmentID: 'DEP-004'
  },
  {
    EmployeeID: 'EMP-1006',
    Name: 'Vong Sreypov (វង្ស ស្រីពៅ)',
    Gender: 'Female',
    Phone: '096 889 900',
    Address: 'សង្កាត់បឹងកក់១, ខណ្ឌទួលគោក, រាជធានីភ្នំពេញ',
    DepartmentID: 'DEP-005'
  }
];

const STORAGE_KEYS = {
  DEPARTMENTS: 'ems_departments',
  EMPLOYEES: 'ems_employees',
  WEB_APP_URL: 'ems_gas_webapp_url',
  MODE: 'ems_connection_mode'
};

export const getStoredDepartments = (): Department[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DEPARTMENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(INITIAL_DEPARTMENTS));
      return INITIAL_DEPARTMENTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_DEPARTMENTS;
  }
};

export const saveStoredDepartments = (departments: Department[]) => {
  localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(departments));
};

export const getStoredEmployees = (): Employee[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(INITIAL_EMPLOYEES));
      return INITIAL_EMPLOYEES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_EMPLOYEES;
  }
};

export const saveStoredEmployees = (employees: Employee[]) => {
  localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
};

export const getStoredWebAppUrl = (): string => {
  return localStorage.getItem(STORAGE_KEYS.WEB_APP_URL) || '';
};

export const saveStoredWebAppUrl = (url: string) => {
  localStorage.setItem(STORAGE_KEYS.WEB_APP_URL, url.trim());
};

export const exportToCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
  const processCell = (cell: any) => {
    let str = cell === null || cell === undefined ? '' : String(cell);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      str = `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csvContent = '\uFEFF' + [
    headers.map(processCell).join(','),
    ...rows.map(row => row.map(processCell).join(','))
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
