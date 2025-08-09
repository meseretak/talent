import {
  Availability,
  AvailabilityStatus,
  DesignType,
  FreelancerStatus,
  MarketingType,
  Prisma,
  PrismaClient,
  ProgrammingType,
  Role,
  SkillType,
  StatisticsInformation,
  User,
  VideoType,
  WritingType,
} from '../../src/generated/prisma';

export default async function seedFreelancerData(prisma: PrismaClient) {
  // Create Categories
  const categories = [
    { name: 'Video Production', description: 'Video creation and editing services' },
    { name: 'Programming & Development', description: 'Software development services' },
    { name: 'Design & Creative', description: 'Design and creative services' },
    { name: 'Writing & Content', description: 'Content creation services' },
    { name: 'Digital Marketing', description: 'Marketing and promotion services' },
    { name: 'Business & Consulting', description: 'Business strategy and consulting' },
  ];

  // Create Skills with specific types
  const skills = [
    {
      name: 'Video Scripting or VSL',
      type: SkillType.VIDEO,
      videoType: VideoType.VSL,
      description: 'Video sales letter scripting',
    },
    {
      name: 'UGC Creation',
      type: SkillType.VIDEO,
      videoType: VideoType.UGC,
      description: 'User-generated content creation',
    },
    {
      name: 'AI Video Production',
      type: SkillType.VIDEO,
      videoType: VideoType.AIV,
      description: 'AI-generated video content',
    },
    { name: 'Video Editing', type: SkillType.VIDEO, description: 'General video editing' },
    {
      name: 'JavaScript Development',
      type: SkillType.PROGRAMMING,
      programmingType: ProgrammingType.FRONTEND,
      description: 'JavaScript development',
    },
    {
      name: 'Python Development',
      type: SkillType.PROGRAMMING,
      programmingType: ProgrammingType.BACKEND,
      description: 'Python programming',
    },
    {
      name: 'UI/UX Design',
      type: SkillType.DESIGN,
      designType: DesignType.UI_UX,
      description: 'User interface and experience design',
    },
    {
      name: 'Motion Graphics',
      type: SkillType.DESIGN,
      designType: DesignType.MOTION,
      description: 'Motion graphics and animation',
    },
    {
      name: 'Branding Design',
      type: SkillType.DESIGN,
      description: 'Visual identity and branding',
    },
    {
      name: 'Technical Writing',
      type: SkillType.WRITING,
      writingType: WritingType.TECHNICAL,
      description: 'Technical documentation',
    },
    {
      name: 'Content Writing',
      type: SkillType.WRITING,
      writingType: WritingType.CONTENT,
      description: 'Blog posts and web content',
    },
    {
      name: 'Social Media Marketing',
      type: SkillType.MARKETING,
      marketingType: MarketingType.SOCIAL,
      description: 'Social media strategy',
    },
    {
      name: 'SEO Optimization',
      type: SkillType.MARKETING,
      marketingType: MarketingType.SEO,
      description: 'Search engine optimization',
    },
  ];

  // Insert Categories and Skills (upsert by name)
  for (const category of categories) {
    await prisma.category.upsert({ where: { name: category.name }, update: {}, create: category });
  }
  for (const skill of skills) {
    await prisma.skill.upsert({ where: { name: skill.name }, update: {}, create: skill });
  }

  // Original Users data without hardcoded IDs
  const originalUsersData: Prisma.UserCreateInput[] = [
    {
      email: 'videoproducer@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'password123',
      role: Role.FREELANCER,
    },
    {
      email: 'developer@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      password: 'password456',
      role: Role.FREELANCER,
    },
    {
      email: 'designer@example.com',
      firstName: 'Mike',
      lastName: 'Johnson',
      password: 'password789',
      role: Role.FREELANCER,
    },
    {
      email: 'writer@example.com',
      firstName: 'Sarah',
      lastName: 'Williams',
      password: 'password101',
      role: Role.FREELANCER,
    },
    {
      email: 'marketer@example.com',
      firstName: 'David',
      lastName: 'Brown',
      password: 'password202',
      role: Role.FREELANCER,
    },
    {
      email: 'consultant@example.com',
      firstName: 'Lisa',
      lastName: 'Davis',
      password: 'password303',
      role: Role.FREELANCER,
    },
  ];

  // Create users and store their generated IDs
  const createdUsers: User[] = [];
  for (const userData of originalUsersData) {
    try {
      const user = await prisma.user.upsert({
        where: { email: userData.email },
        update: { firstName: userData.firstName, lastName: userData.lastName, role: userData.role },
        create: userData,
      });
      createdUsers.push(user);
      console.log(`User created/updated: ${user.email}`);
    } catch (error) {
      console.error(`Error creating user ${userData.email}:`, error);
    }
  }

  // Create availabilities without hardcoded IDs
  const availabilities: Availability[] = [];
  for (let i = 0; i < createdUsers.length; i++) {
    const availabilityData: Prisma.AvailabilityCreateInput = {
      status: AvailabilityStatus.AVAILABLE,
      availableHoursPerWeek:
        i === 0 ? 40 : i === 1 ? 30 : i === 2 ? 25 : i === 3 ? 35 : i === 4 ? 20 : 15,
      notes:
        i === 0
          ? 'Full-time'
          : i === 1
          ? 'Part-time'
          : i === 2
          ? 'Flexible hours'
          : i === 3
          ? 'Evening availability'
          : i === 4
          ? 'Weekend only'
          : 'Limited hours',
    };
    const availability = await prisma.availability.create({
      data: availabilityData,
    });
    availabilities.push(availability);
  }

  // Create statistics without hardcoded IDs
  const statistics: StatisticsInformation[] = [];
  for (let i = 0; i < createdUsers.length; i++) {
    const statsData: Prisma.StatisticsInformationCreateInput = {
      totalEarnings:
        i === 0
          ? 15000
          : i === 1
          ? 25000
          : i === 2
          ? 8000
          : i === 3
          ? 12000
          : i === 4
          ? 18000
          : 5000,
      totalProjects: i === 0 ? 25 : i === 1 ? 40 : i === 2 ? 15 : i === 3 ? 30 : i === 4 ? 35 : 10,
      totalTasks: i === 0 ? 150 : i === 1 ? 200 : i === 2 ? 80 : i === 3 ? 120 : i === 4 ? 180 : 50,
      totalReviews: i === 0 ? 20 : i === 1 ? 35 : i === 2 ? 12 : i === 3 ? 25 : i === 4 ? 30 : 8,
      totalRating:
        i === 0 ? 4.8 : i === 1 ? 4.9 : i === 2 ? 4.5 : i === 3 ? 4.7 : i === 4 ? 4.6 : 4.3,
      totalClients: i === 0 ? 15 : i === 1 ? 25 : i === 2 ? 8 : i === 3 ? 18 : i === 4 ? 22 : 6,
      totalJobsCompleted:
        i === 0 ? 23 : i === 1 ? 38 : i === 2 ? 14 : i === 3 ? 28 : i === 4 ? 33 : 9,
      totalJobsOngoing: i === 0 ? 2 : i === 1 ? 2 : i === 2 ? 1 : i === 3 ? 2 : i === 4 ? 2 : 1,
      totalJobsPending: i === 0 ? 0 : i === 1 ? 0 : i === 2 ? 0 : i === 3 ? 0 : i === 4 ? 0 : 0,
      totalJobsCancelled: i === 0 ? 0 : i === 1 ? 0 : i === 2 ? 0 : i === 3 ? 0 : i === 4 ? 0 : 0,
      totalJobsOnHold: i === 0 ? 0 : i === 1 ? 0 : i === 2 ? 0 : i === 3 ? 0 : i === 4 ? 0 : 0,
      totalStorageUsed:
        i === 0 ? 500 : i === 1 ? 800 : i === 2 ? 300 : i === 3 ? 600 : i === 4 ? 700 : 200,
    };
    const stats = await prisma.statisticsInformation.create({
      data: statsData,
    });
    statistics.push(stats);
  }

  // Create freelancers with the generated IDs
  const originalFreelancersData: Prisma.FreelancerCreateInput[] = [
    {
      user: { connect: { id: createdUsers[0].id } },
      headline: 'Expert Video Producer',
      bio: '10+ years of experience in video production',
      about:
        'Specialized in creating engaging video content for brands and businesses. Expert in Adobe Premiere Pro, After Effects, and DaVinci Resolve.',
      status: FreelancerStatus.APPROVED,
      bannerPhoto: 'https://example.com/banner1.jpg',
      profilePhoto: 'https://example.com/profile1.jpg',
      skills: { connect: [{ name: 'Video Scripting or VSL' }, { name: 'Video Editing' }] },
      categories: { connect: [{ name: 'Video Production' }] },
      availability: { connect: { id: availabilities[0].id } },
      statisticsInformation: { connect: { id: statistics[0].id } },
    },
    {
      user: { connect: { id: createdUsers[1].id } },
      headline: 'Full Stack Developer',
      bio: '5+ years building scalable web applications',
      about:
        'Passionate about creating robust and scalable web applications. Proficient in JavaScript, Python, React, Node.js, and cloud technologies.',
      status: FreelancerStatus.APPROVED,
      bannerPhoto: 'https://example.com/banner2.jpg',
      profilePhoto: 'https://example.com/profile2.jpg',
      skills: { connect: [{ name: 'JavaScript Development' }, { name: 'Python Development' }] },
      categories: { connect: [{ name: 'Programming & Development' }] },
      availability: { connect: { id: availabilities[1].id } },
      statisticsInformation: { connect: { id: statistics[1].id } },
    },
    {
      user: { connect: { id: createdUsers[2].id } },
      headline: 'Creative UI/UX Designer',
      bio: '3+ years designing user-centered digital experiences',
      about:
        'Focused on creating intuitive and beautiful user interfaces. Expert in Figma, Adobe Creative Suite, and user research methodologies.',
      status: FreelancerStatus.APPROVED,
      bannerPhoto: 'https://example.com/banner3.jpg',
      profilePhoto: 'https://example.com/profile3.jpg',
      skills: { connect: [{ name: 'UI/UX Design' }, { name: 'Branding Design' }] },
      categories: { connect: [{ name: 'Design & Creative' }] },
      availability: { connect: { id: availabilities[2].id } },
      statisticsInformation: { connect: { id: statistics[2].id } },
    },
    {
      user: { connect: { id: createdUsers[3].id } },
      headline: 'Content Writer & Copywriter',
      bio: '4+ years crafting compelling content',
      about:
        'Specialized in creating engaging content that converts. Experience in blog writing, copywriting, and content strategy for various industries.',
      status: FreelancerStatus.APPROVED,
      bannerPhoto: 'https://example.com/banner4.jpg',
      profilePhoto: 'https://example.com/profile4.jpg',
      skills: { connect: [{ name: 'Content Writing' }, { name: 'Technical Writing' }] },
      categories: { connect: [{ name: 'Writing & Content' }] },
      availability: { connect: { id: availabilities[3].id } },
      statisticsInformation: { connect: { id: statistics[3].id } },
    },
    {
      user: { connect: { id: createdUsers[4].id } },
      headline: 'Digital Marketing Specialist',
      bio: '6+ years driving growth through digital channels',
      about:
        'Expert in social media marketing, SEO, and paid advertising. Proven track record of increasing brand awareness and driving conversions.',
      status: FreelancerStatus.APPROVED,
      bannerPhoto: 'https://example.com/banner5.jpg',
      profilePhoto: 'https://example.com/profile5.jpg',
      skills: { connect: [{ name: 'Social Media Marketing' }, { name: 'SEO Optimization' }] },
      categories: { connect: [{ name: 'Digital Marketing' }] },
      availability: { connect: { id: availabilities[4].id } },
      statisticsInformation: { connect: { id: statistics[4].id } },
    },
    {
      user: { connect: { id: createdUsers[5].id } },
      headline: 'Business Strategy Consultant',
      bio: '8+ years helping businesses scale and optimize',
      about:
        'Strategic consultant with expertise in business development, process optimization, and market analysis. Worked with startups to Fortune 500 companies.',
      status: FreelancerStatus.PENDING,
      bannerPhoto: 'https://example.com/banner6.jpg',
      profilePhoto: 'https://example.com/profile6.jpg',
      skills: { connect: [{ name: 'Content Writing' }] },
      categories: { connect: [{ name: 'Business & Consulting' }] },
      availability: { connect: { id: availabilities[5].id } },
      statisticsInformation: { connect: { id: statistics[5].id } },
    },
  ];

  // Create freelancers
  for (const freelancerData of originalFreelancersData) {
    try {
      await prisma.freelancer.upsert({
        where: { userId: freelancerData.user.connect!.id },
        create: freelancerData,
        update: {
          headline: freelancerData.headline,
          bio: freelancerData.bio,
          about: freelancerData.about,
          status: freelancerData.status,
          bannerPhoto: freelancerData.bannerPhoto,
          profilePhoto: freelancerData.profilePhoto,
          skills: freelancerData.skills,
          categories: freelancerData.categories,
          availability: freelancerData.availability,
          statisticsInformation: freelancerData.statisticsInformation,
        },
      });
      console.log(
        `Original freelancer created/updated for user: ${freelancerData.user.connect!.id}`,
      );
    } catch (error) {
      console.error(
        `Error creating original freelancer for user ${freelancerData.user.connect!.id}:`,
        error,
      );
    }
  }

  // Add portfolio items and certifications for original freelancers
  console.log('Adding portfolio items and certifications for original freelancers...');
  
  // Portfolio items for original freelancers
  const originalPortfolioData = [
    // Video Producer
    [
      { title: 'Brand Commercial', projectURL: 'https://example.com/video1', description: '30-second brand commercial for tech startup' },
      { title: 'Product Demo', projectURL: 'https://example.com/video2', description: 'Product demonstration video for e-commerce' },
    ],
    // Developer
    [
      { title: 'E-commerce Platform', projectURL: 'https://example.com/dev1', description: 'Full-stack e-commerce solution built with React and Node.js' },
      { title: 'Mobile App', projectURL: 'https://example.com/dev2', description: 'Cross-platform mobile app for fitness tracking' },
    ],
    // Designer
    [
      { title: 'SaaS Dashboard', imageURL: 'https://example.com/design1', description: 'Modern dashboard design for SaaS platform' },
      { title: 'Brand Identity', imageURL: 'https://example.com/design2', description: 'Complete brand identity package for startup' },
    ],
    // Writer
    [
      { title: 'Blog Series', projectURL: 'https://example.com/write1', description: '10-part blog series on digital marketing' },
      { title: 'Product Copy', projectURL: 'https://example.com/write2', description: 'Compelling product descriptions for online store' },
    ],
    // Marketer
    [
      { title: 'Social Media Campaign', projectURL: 'https://example.com/marketing1', description: 'Successful social media campaign with 50% increase in engagement' },
      { title: 'SEO Optimization', projectURL: 'https://example.com/marketing2', description: 'SEO strategy that improved organic traffic by 200%' },
    ],
    // Consultant
    [
      { title: 'Business Strategy', projectURL: 'https://example.com/consult1', description: 'Strategic business plan for startup expansion' },
      { title: 'Process Optimization', projectURL: 'https://example.com/consult2', description: 'Workflow optimization that increased efficiency by 40%' },
    ],
  ];

  // Certifications for original freelancers
  const originalCertificationData = [
    // Video Producer
    [
      { name: 'Adobe Premiere Pro Certified', issuingOrganization: 'Adobe', issueDate: '2023-01-15' },
      { name: 'DaVinci Resolve Advanced', issuingOrganization: 'Blackmagic Design', issueDate: '2022-08-20' },
    ],
    // Developer
    [
      { name: 'AWS Certified Developer', issuingOrganization: 'Amazon Web Services', issueDate: '2023-03-10' },
      { name: 'React Advanced Certification', issuingOrganization: 'Meta', issueDate: '2022-11-05' },
    ],
    // Designer
    [
      { name: 'Figma Design System Specialist', issuingOrganization: 'Figma', issueDate: '2023-02-18' },
      { name: 'Adobe Creative Suite Master', issuingOrganization: 'Adobe', issueDate: '2022-09-12' },
    ],
    // Writer
    [
      { name: 'Content Marketing Certification', issuingOrganization: 'HubSpot', issueDate: '2023-01-30' },
      { name: 'Copywriting Masterclass', issuingOrganization: 'Copyblogger', issueDate: '2022-07-15' },
    ],
    // Marketer
    [
      { name: 'Google Ads Certification', issuingOrganization: 'Google', issueDate: '2023-04-05' },
      { name: 'Facebook Blueprint', issuingOrganization: 'Meta', issueDate: '2022-12-20' },
    ],
    // Consultant
    [
      { name: 'Project Management Professional', issuingOrganization: 'PMI', issueDate: '2022-06-10' },
      { name: 'Business Strategy Certification', issuingOrganization: 'Harvard Business School', issueDate: '2023-01-25' },
    ],
  ];

  // Add portfolio items and certifications for each original freelancer
  for (let i = 0; i < createdUsers.length; i++) {
    try {
      const freelancerRecord = await prisma.freelancer.findUnique({
        where: { userId: createdUsers[i].id },
      });

      if (freelancerRecord) {
        // Add portfolio items
        await prisma.portfolioItem.deleteMany({ where: { freelancerId: freelancerRecord.id } });
        for (const item of originalPortfolioData[i]) {
          await prisma.portfolioItem.create({ 
            data: { 
              ...item, 
              freelancerId: freelancerRecord.id 
            } 
          });
        }

        // Add certifications
        await prisma.certification.deleteMany({ where: { freelancerId: freelancerRecord.id } });
        for (const cert of originalCertificationData[i]) {
          await prisma.certification.create({
            data: { 
              ...cert, 
              issueDate: new Date(cert.issueDate), 
              freelancerId: freelancerRecord.id 
            },
          });
        }

        console.log(`Added portfolio and certifications for: ${createdUsers[i].firstName} ${createdUsers[i].lastName}`);
      }
    } catch (error) {
      console.error(`Error adding portfolio/certifications for user ${createdUsers[i].id}:`, error);
    }
  }

  // New Talents Data - Using NAMES for skills/categories
  const newTalentsRawData = [
    {
      email: 'temesgen.asres@example.com',
      password: 'SecureTem123!',
      firstName: 'Temesgen',
      lastName: 'Asres',
      headline: 'Conversion-Driven VSL Video Editor',
      bio: 'Crafting VSLs.',
      about: 'Premiere & Camtasia.',
      bannerPhoto: 'http://localhost:4000/uploads/partern.jpg',
      profilePhoto: 'http://localhost:4000/uploads/1.png',
      availability: {
        status: AvailabilityStatus.AVAILABLE,
        availableHoursPerWeek: 30,
        notes: 'Long-term VSL projects',
      },
      skills: ['Video Scripting or VSL', 'Video Editing'],
      categories: ['Video Production'],
      portfolio: [{ title: 'Sales Video', projectURL: 'https://example.com/vsl-temesgen' }],
    },
    {
      email: 'biruk.tesfaye@example.com',
      password: 'UGCbiruk99!',
      firstName: 'Biruk',
      lastName: 'Tesfaye',
      headline: 'Authentic UGC Creator',
      bio: 'Short-form video.',
      about: 'Fashion & lifestyle.',
      bannerPhoto: 'http://localhost:4000/uploads/partern.jpg',
      profilePhoto: 'http://localhost:4000/uploads/2.png',
      availability: { status: AvailabilityStatus.AVAILABLE, availableHoursPerWeek: 20 },
      skills: ['UGC Creation', 'Social Media Marketing'],
      categories: ['Video Production'],
      portfolio: [{ title: 'IG Reels', projectURL: 'https://example.com/ugc-biruk' }],
    },
    {
      email: 'fremnatos.abrham@example.com',
      password: 'AIvision@2024',
      firstName: 'Fremnatos',
      lastName: 'Abrham',
      headline: 'Creative AI Video Editor',
      bio: 'Runway & Kaiber.',
      about: 'Tech & influencers.',
      bannerPhoto: 'http://localhost:4000/uploads/partern.jpg',
      profilePhoto: 'http://localhost:4000/uploads/3.png',
      availability: { status: AvailabilityStatus.AVAILABLE, availableHoursPerWeek: 35 },
      skills: ['AI Video Production', 'Motion Graphics'],
      categories: ['Video Production'],
      portfolio: [{ title: 'SaaS Explainer', projectURL: 'https://example.com/ai-fremnatos' }],
      certifications: [
        { name: 'Runway AI Masterclass', issuingOrganization: 'Runway', issueDate: '2024-03-10' },
      ],
    },
    {
      email: 'nebiyu.tesfaye@example.com',
      password: 'NebiyuDesign77',
      firstName: 'Nebiyu',
      lastName: 'Tesfaye',
      headline: 'Visual Branding Specialist',
      bio: 'Branding & digital product.',
      about: 'Illustrator, Photoshop, Figma.',
      bannerPhoto: 'http://localhost:4000/uploads/partern.jpg',
      profilePhoto: 'http://localhost:4000/uploads/4.png',
      availability: { status: AvailabilityStatus.AVAILABLE, availableHoursPerWeek: 40 },
      skills: ['UI/UX Design', 'Branding Design'],
      categories: ['Design & Creative'],
      portfolio: [{ title: 'EdTech Branding', imageURL: 'https://example.com/brand-nebiyu' }],
    },
    {
      email: 'blen.addisu@example.com',
      password: 'VSLqueen@2024',
      firstName: 'Blen',
      lastName: 'Addisu',
      headline: 'Storytelling VSL Editor',
      bio: 'Course creators & coaches.',
      about: 'Compelling video narratives.',
      bannerPhoto: 'http://localhost:4000/uploads/partern.jpg',
      profilePhoto: 'http://localhost:4000/uploads/5.png',
      availability: { status: AvailabilityStatus.AVAILABLE, availableHoursPerWeek: 40 },
      skills: ['Video Editing', 'Content Writing'],
      categories: ['Video Production'],
      portfolio: [{ title: 'Course VSL', projectURL: 'https://example.com/vsl-blen' }],
    },
    {
      email: 'tsega.legesse@example.com',
      password: 'TsegaUGC#88',
      firstName: 'Tsega',
      lastName: 'Legesse',
      headline: 'Short-Form Video Creator',
      bio: 'Lifestyle & skincare UGC.',
      about: 'Relatable content.',
      bannerPhoto: 'http://localhost:4000/uploads/partern.jpg',
      profilePhoto: 'http://localhost:4000/uploads/6.png',
      availability: { status: AvailabilityStatus.AVAILABLE, availableHoursPerWeek: 40 },
      skills: ['UGC Creation', 'Social Media Marketing'],
      categories: ['Video Production'],
      portfolio: [{ title: 'UGC Campaign', projectURL: 'https://example.com/ugc-tsega' }],
    },
    {
      email: 'eyasu.tilahun@example.com',
      password: 'AiVisionary$55',
      firstName: 'Eyasu',
      lastName: 'Tilahun',
      headline: 'AI-Powered Storyteller',
      bio: 'AI for video.',
      about: 'Influencers & SaaS.',
      bannerPhoto: 'http://localhost:4000/uploads/partern.jpg',
      profilePhoto: 'http://localhost:4000/uploads/7.png',
      availability: { status: AvailabilityStatus.AVAILABLE, availableHoursPerWeek: 40 },
      skills: ['AI Video Production', 'Video Editing'],
      categories: ['Video Production'],
      portfolio: [{ title: 'AI Motion Series', imageURL: 'https://example.com/ai-eyasu' }],
    },
    {
      email: 'kaleb.tilahun@example.com',
      password: 'DesignItRight44',
      firstName: 'Kaleb',
      lastName: 'Tilahun',
      headline: 'Modern Graphics Designer',
      bio: 'Minimalist & futuristic.',
      about: 'Figma & Adobe.',
      bannerPhoto: 'http://localhost:4000/uploads/partern.jpg',
      profilePhoto: 'http://localhost:4000/uploads/8.png',
      availability: { status: AvailabilityStatus.AVAILABLE, availableHoursPerWeek: 40 },
      skills: ['UI/UX Design', 'Branding Design'],
      categories: ['Design & Creative'],
      portfolio: [{ title: 'Landing Page & Logo', imageURL: 'https://example.com/design-kaleb' }],
    },
  ];

  type PreparedFreelancerData = {
    email: string;
    userId: number;
    freelancerCreateInput: Prisma.FreelancerCreateInput;
    freelancerUpdateInput: Prisma.FreelancerUpdateInput;
    portfolio: Array<{ title: string; projectURL?: string; imageURL?: string }>;
    certifications: Array<{ name: string; issuingOrganization: string; issueDate: string | Date }>;
  };

  const preparedFreelancerSeedData: PreparedFreelancerData[] = [];

  for (const talent of newTalentsRawData) {
    const user = await prisma.user.upsert({
      where: { email: talent.email },
      update: { firstName: talent.firstName, lastName: talent.lastName, role: Role.FREELANCER },
      create: {
        email: talent.email,
        password: talent.password,
        firstName: talent.firstName,
        lastName: talent.lastName,
        role: Role.FREELANCER,
      },
    });

    // Check if freelancer already exists
    const existingFreelancer = await prisma.freelancer.findUnique({
      where: { userId: user.id },
      include: { availability: true, statisticsInformation: true },
    });

    let availability;
    let stats;

    if (existingFreelancer) {
      // Update existing availability and stats
      availability = await prisma.availability.update({
        where: { id: existingFreelancer.availabilityId },
        data: { ...talent.availability, status: talent.availability.status as AvailabilityStatus },
      });
      stats = await prisma.statisticsInformation.update({
        where: { id: existingFreelancer.statisticsInformationId },
        data: {
          totalEarnings: 0,
          totalProjects: 0,
          totalTasks: 0,
          totalReviews: 0,
          totalRating: 0,
          totalClients: 0,
          totalJobsCompleted: 0,
          totalJobsOngoing: 0,
          totalJobsPending: 0,
          totalJobsCancelled: 0,
          totalJobsOnHold: 0,
          totalStorageUsed: 0,
        },
      });
    } else {
      // Create new availability and stats
      availability = await prisma.availability.create({
        data: { ...talent.availability, status: talent.availability.status as AvailabilityStatus },
      });
      stats = await prisma.statisticsInformation.create({
        data: {
          totalEarnings: 0,
          totalProjects: 0,
          totalTasks: 0,
          totalReviews: 0,
          totalRating: 0,
          totalClients: 0,
          totalJobsCompleted: 0,
          totalJobsOngoing: 0,
          totalJobsPending: 0,
          totalJobsCancelled: 0,
          totalJobsOnHold: 0,
          totalStorageUsed: 0,
        },
      });
    }

    const freelancerCreateInput: Prisma.FreelancerCreateInput = {
      user: { connect: { id: user.id } },
      headline: talent.headline,
      bio: talent.bio,
      about: talent.about || talent.bio,
      status: FreelancerStatus.APPROVED,
      bannerPhoto: talent.bannerPhoto || null,
      profilePhoto: talent.profilePhoto || null,
      availability: { connect: { id: availability.id } },
      statisticsInformation: { connect: { id: stats.id } },
      skills:
        talent.skills && talent.skills.length > 0
          ? { connect: talent.skills.map((name: string) => ({ name })) }
          : undefined,
      categories:
        talent.categories && talent.categories.length > 0
          ? { connect: talent.categories.map((name: string) => ({ name })) }
          : undefined,
    };

    const freelancerUpdateInput: Prisma.FreelancerUpdateInput = {
      headline: talent.headline,
      bio: talent.bio,
      about: talent.about || talent.bio,
      status: FreelancerStatus.APPROVED,
      bannerPhoto: talent.bannerPhoto || null,
      profilePhoto: talent.profilePhoto || null,
      availability: { connect: { id: availability.id } },
      statisticsInformation: { connect: { id: stats.id } },
      skills:
        talent.skills && talent.skills.length > 0
          ? { set: talent.skills.map((name: string) => ({ name })) }
          : { set: [] },
      categories:
        talent.categories && talent.categories.length > 0
          ? { set: talent.categories.map((name: string) => ({ name })) }
          : { set: [] },
    };

    preparedFreelancerSeedData.push({
      email: talent.email,
      userId: user.id,
      freelancerCreateInput,
      freelancerUpdateInput,
      portfolio: talent.portfolio || [],
      certifications: talent.certifications || [],
    });
  }

  for (const prepared of preparedFreelancerSeedData) {
    console.log(`Processing freelancer: ${prepared.email}`);

    try {
      await prisma.freelancer.upsert({
        where: { userId: prepared.userId },
        create: prepared.freelancerCreateInput,
        update: prepared.freelancerUpdateInput,
      });

      const freelancerRecord = await prisma.freelancer.findUnique({
        where: { userId: prepared.userId },
      });

      if (!freelancerRecord) {
        console.error(`Failed to create/find freelancer for user: ${prepared.userId}`);
        continue;
      }

      console.log(`Freelancer created/updated: ${freelancerRecord.id}`);

      // Handle portfolio items
      await prisma.portfolioItem.deleteMany({ where: { freelancerId: freelancerRecord.id } });
      for (const item of prepared.portfolio) {
        await prisma.portfolioItem.create({ data: { ...item, freelancerId: freelancerRecord.id } });
      }

      // Handle certifications
      await prisma.certification.deleteMany({ where: { freelancerId: freelancerRecord.id } });
      for (const cert of prepared.certifications) {
        await prisma.certification.create({
          data: { ...cert, issueDate: new Date(cert.issueDate), freelancerId: freelancerRecord.id },
        });
      }

      console.log(`Successfully seeded freelancer: ${prepared.email}`);
    } catch (error) {
      console.error(`Error seeding freelancer ${prepared.email}:`, error);
    }
  }

  // Summary
  const totalFreelancers = await prisma.freelancer.count();
  const totalUsers = await prisma.user.count({ where: { role: Role.FREELANCER } });
  console.log(`\n=== Seed Summary ===`);
  console.log(`Total freelancers in database: ${totalFreelancers}`);
  console.log(`Total users with FREELANCER role: ${totalUsers}`);

  // Show some sample freelancers
  const sampleFreelancers = await prisma.freelancer.findMany({
    take: 3,
    include: {
      user: { select: { email: true, firstName: true, lastName: true } },
      availability: true,
      statisticsInformation: true,
    },
  });

  console.log(`\nSample freelancers created:`);
  sampleFreelancers.forEach((freelancer, index) => {
    console.log(
      `${index + 1}. ${freelancer.user.firstName} ${freelancer.user.lastName} (${
        freelancer.user.email
      })`,
    );
    console.log(`   - Headline: ${freelancer.headline}`);
    console.log(`   - Status: ${freelancer.status}`);
    console.log(`   - Availability ID: ${freelancer.availabilityId}`);
    console.log(`   - Stats ID: ${freelancer.statisticsInformationId}`);
  });
}
