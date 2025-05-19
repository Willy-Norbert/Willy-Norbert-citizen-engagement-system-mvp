
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Department = mongoose.model('Department');

// Route to seed initial departments
router.post('/departments', async (req, res) => {
    try {
        // Define default departments with their categories
        const defaultDepartments = [
            {
                name: "Sanitation Department",
                description: "Handles issues related to waste management and cleanliness",
                categories: ["garbage", "sewage", "public toilets", "waste collection"],
                contactEmail: "sanitation@example.gov",
                contactPhone: "123-456-7890",
                active: true
            },
            {
                name: "Roads & Infrastructure",
                description: "Handles issues related to roads, bridges, and public infrastructure",
                categories: ["potholes", "road damage", "street lights", "bridges", "footpaths"],
                contactEmail: "roads@example.gov",
                contactPhone: "123-456-7891",
                active: true
            },
            {
                name: "Water Supply",
                description: "Handles issues related to water supply and quality",
                categories: ["water shortage", "water quality", "leakage", "billing"],
                contactEmail: "water@example.gov",
                contactPhone: "123-456-7892",
                active: true
            },
            {
                name: "Power & Electricity",
                description: "Handles issues related to electricity supply",
                categories: ["power outage", "electrical hazards", "street lights", "billing"],
                contactEmail: "power@example.gov",
                contactPhone: "123-456-7893",
                active: true
            },
            {
                name: "Health & Safety",
                description: "Handles issues related to public health and safety",
                categories: ["public health", "disease outbreak", "stray animals", "mosquito menace"],
                contactEmail: "health@example.gov",
                contactPhone: "123-456-7894",
                active: true
            }
        ];

        // Check if departments already exist
        const existingDepartments = await Department.find();
        if (existingDepartments.length > 0) {
            return res.status(200).json({
                success: true,
                message: "Departments already exist",
                count: existingDepartments.length,
                data: existingDepartments
            });
        }

        // Create the departments
        const departments = await Department.insertMany(defaultDepartments);
        
        res.status(201).json({
            success: true,
            message: "Default departments created successfully",
            count: departments.length,
            data: departments
        });
    } catch (error) {
        console.error('Error seeding departments:', error);
        res.status(500).json({
            success: false,
            message: "Error seeding departments",
            error: error.message
        });
    }
});

module.exports = router;
