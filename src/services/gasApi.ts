import { Department, Employee } from '../types';

export interface GasApiResponse<T = any> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
  departments?: Department[];
  employees?: Employee[];
  spreadsheetName?: string;
}

/**
 * Ping the Google Apps Script Web App to verify connectivity
 */
export async function pingGasApi(url: string): Promise<GasApiResponse> {
  const cleanUrl = url.trim();
  if (!cleanUrl) {
    throw new Error('Please provide a Google Apps Script Web App URL.');
  }

  const queryUrl = `${cleanUrl}${cleanUrl.includes('?') ? '&' : '?'}action=ping&_t=${Date.now()}`;
  const response = await fetch(queryUrl, {
    method: 'GET',
    redirect: 'follow',
  });

  if (!response.ok) {
    throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

/**
 * Fetch all Departments and Employees from Google Apps Script Web App
 */
export async function fetchAllFromGas(url: string): Promise<{
  departments: Department[];
  employees: Employee[];
  spreadsheetName?: string;
}> {
  const cleanUrl = url.trim();
  const queryUrl = `${cleanUrl}${cleanUrl.includes('?') ? '&' : '?'}action=getAll&_t=${Date.now()}`;

  const response = await fetch(queryUrl, {
    method: 'GET',
    redirect: 'follow',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch from Google Apps Script: ${response.statusText}`);
  }

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || 'Failed to retrieve data from Google Sheets');
  }

  return {
    departments: result.departments || [],
    employees: result.employees || [],
    spreadsheetName: result.spreadsheetName,
  };
}

/**
 * Send POST mutation to Google Apps Script Web App
 */
export async function postToGas<T = any>(
  url: string,
  action: string,
  data?: any
): Promise<GasApiResponse<T>> {
  const cleanUrl = url.trim();
  const payload = {
    action,
    data,
    ...data, // spread in case action looks for root fields like DepartmentID / EmployeeID
  };

  // Google Apps Script handles text/plain without triggering difficult CORS preflight checks
  const response = await fetch(cleanUrl, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
    body: JSON.stringify(payload),
    redirect: 'follow',
  });

  if (!response.ok) {
    throw new Error(`Failed to execute ${action}: ${response.statusText}`);
  }

  const result = await response.json();
  return result;
}
