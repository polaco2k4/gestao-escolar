const axios = require('axios');

const API_URL = 'http://localhost:5000';

async function checkAcademicYear() {
  try {
    console.log('Checking academic years...\n');

    // Login as admin
    const login = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'admin@escola.ao',
      password: 'Admin@123'
    });
    const authToken = login.data.data.access_token;
    const headers = { Authorization: `Bearer ${authToken}` };

    // Get schools
    const schoolsRes = await axios.get(`${API_URL}/api/schools`, { headers });
    const schools = schoolsRes.data.data.schools || schoolsRes.data.data;
    const schoolId = schools[0].id;

    // Check if there's an academic year
    try {
      const academicYearsRes = await axios.get(`${API_URL}/api/academic-years`, { headers });
      const academicYears = academicYearsRes.data.data.academicYears || academicYearsRes.data.data;
      
      console.log('Academic years found:', academicYears.length);
      if (academicYears.length > 0) {
        academicYears.forEach(ay => {
          console.log(`  - ${ay.name} (${ay.start_date} to ${ay.end_date}) - Current: ${ay.is_current}`);
        });
      } else {
        console.log('No academic years found. Creating one...');
        
        // Create academic year
        const newYear = await axios.post(`${API_URL}/api/academic-years`, {
          school_id: schoolId,
          name: '2025-2026',
          start_date: '2025-09-01',
          end_date: '2026-07-31',
          is_current: true
        }, { headers });
        
        console.log('✅ Academic year created:', newYear.data.data.name);
      }
    } catch (error) {
      console.error('Error checking/creating academic year:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    process.exit(1);
  }
}

checkAcademicYear();
