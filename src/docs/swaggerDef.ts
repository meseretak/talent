import fs from 'fs';
import path from 'path';
import YAML from 'yaml';
import { description, name, version } from '../../package.json';
import config from '../config/config';

// Define paths to individual YAML files
const libraryComponentsPath = path.join(__dirname, './components/libraryComponents.yml');
const settingComponentsPath = path.join(__dirname, './components/settingComponents.yml');
const projectComponentsPath = path.join(__dirname, './components/projectComponents.yml');
const notificationComponentsPath = path.join(__dirname, './components/notificationComponents.yml');
const subscriptionComponentsPath = path.join(__dirname, './components/subscriptionComponents.yml');
const userComponentsPath = path.join(__dirname, './components/userComponents.yml');
const hireComponentsPath = path.join(__dirname, './components/hireComponents.yml');
const authComponentsPath = path.join(__dirname, './components/authComponents.yml');
const chatComponentsPath = path.join(__dirname, './components/chatComponents.yml');
const referralComponentsPath = path.join(__dirname, './components/referralComponents.yml');
const userPathsPath = path.join(__dirname, './paths/userPaths.yml');
const freelancerPathsPath = path.join(__dirname, './paths/freelancerPaths.yml');
const chatPathsPath = path.join(__dirname, './paths/chatPaths.yml');
const authPathsPath = path.join(__dirname, './paths/authPaths.yml');
const libraryPathsPath = path.join(__dirname, './paths/libraryPaths.yml');
const paymentPathsPath = path.join(__dirname, './paths/paymentPaths.yml');
const projectPathsPath = path.join(__dirname, './paths/projectPaths.yml');
const resourcePathsPath = path.join(__dirname, './paths/resourcePaths.yml');
const schedulePathsPath = path.join(__dirname, './paths/schedulePaths.yml');
const subscriptionPathsPath = path.join(__dirname, './paths/subscriptionPaths.yml');
const taskPathsPath = path.join(__dirname, './paths/taskPaths.yml');
const hirePathsPath = path.join(__dirname, './paths/hirePaths.yml');
const uploadPathsPath = path.join(__dirname, './paths/uploadPaths.yml');
const pricingPathsPath = path.join(__dirname, './paths/pricingPaths.yml');
const planPathsPath = path.join(__dirname, './paths/planPaths.yml');
const securityPathsPath = path.join(__dirname, './paths/securityPaths.yml');
const emailPathsPath = path.join(__dirname, './paths/emailPaths.yml');
const otpPathsPath = path.join(__dirname, './paths/otpPaths.yml');
const creditPathsPath = path.join(__dirname, './paths/creditPaths.yml');
const referralPathsPath = path.join(__dirname, './paths/referralPaths.yml');
const webhookPathsPath = path.join(__dirname, './paths/webhookPaths.yml');
const pmPathsPath = path.join(__dirname, './paths/pmPaths.yml');
const discountPathsPath = path.join(__dirname, './paths/discountPaths.yml');
const clientPathsPath = path.join(__dirname, './paths/clientPaths.yml');
const notificationPathsPath = path.join(__dirname, './paths/notificationPaths.yml');

// Read and parse components and paths from YAML files
const libraryComponentsFile = fs.readFileSync(libraryComponentsPath, 'utf8');
const settingComponentsFile = fs.readFileSync(settingComponentsPath, 'utf8');
const projectComponentsFile = fs.readFileSync(projectComponentsPath, 'utf8');
const notificationComponentsFile = fs.readFileSync(notificationComponentsPath, 'utf8');
const subscriptionComponentsFile = fs.readFileSync(subscriptionComponentsPath, 'utf8');
const userComponentsFile = fs.readFileSync(userComponentsPath, 'utf8');
const hireComponentsFile = fs.readFileSync(hireComponentsPath, 'utf8');
const authComponentsFile = fs.readFileSync(authComponentsPath, 'utf8');
const chatComponentsFile = fs.readFileSync(chatComponentsPath, 'utf8');
const referralComponentsFile = fs.readFileSync(referralComponentsPath, 'utf8');

const userPathsFile = fs.readFileSync(userPathsPath, 'utf8');
const freelancerPathsFile = fs.readFileSync(freelancerPathsPath, 'utf8');
const chatPathsFile = fs.readFileSync(chatPathsPath, 'utf8');
const authPathsFile = fs.readFileSync(authPathsPath, 'utf8');
const libraryPathsFile = fs.readFileSync(libraryPathsPath, 'utf8');
const paymentPathsFile = fs.readFileSync(paymentPathsPath, 'utf8');
const projectPathsFile = fs.readFileSync(projectPathsPath, 'utf8');
const resourcePathsFile = fs.readFileSync(resourcePathsPath, 'utf8');
const schedulePathsFile = fs.readFileSync(schedulePathsPath, 'utf8');
const subscriptionPathsFile = fs.readFileSync(subscriptionPathsPath, 'utf8');
const taskPathsFile = fs.readFileSync(taskPathsPath, 'utf8');
const hirePathsFile = fs.readFileSync(hirePathsPath, 'utf8');
const uploadPathsFile = fs.readFileSync(uploadPathsPath, 'utf8');
const pricingPathsFile = fs.readFileSync(pricingPathsPath, 'utf8');
const planPathsFile = fs.readFileSync(planPathsPath, 'utf8');
const securityPathsFile = fs.readFileSync(securityPathsPath, 'utf8');
const emailPathsFile = fs.readFileSync(emailPathsPath, 'utf8');
const otpPathsFile = fs.readFileSync(otpPathsPath, 'utf8');
const creditPathsFile = fs.readFileSync(creditPathsPath, 'utf8');
const referralPathsFile = fs.readFileSync(referralPathsPath, 'utf8');
const webhookPathsFile = fs.readFileSync(webhookPathsPath, 'utf8');
const pmPathsFile = fs.readFileSync(pmPathsPath, 'utf8');
const discountPathsFile = fs.readFileSync(discountPathsPath, 'utf8');
const clientPathsFile = fs.readFileSync(clientPathsPath, 'utf8');
const notificationPathsFile = fs.readFileSync(notificationPathsPath, 'utf8');

// Parse components and paths
const libraryComponents = YAML.parse(libraryComponentsFile).components;
const settingComponents = YAML.parse(settingComponentsFile).components;
const projectComponents = YAML.parse(projectComponentsFile).components;
const notificationComponents = YAML.parse(notificationComponentsFile).components;
const subscriptionComponents = YAML.parse(subscriptionComponentsFile).components;
const userComponents = YAML.parse(userComponentsFile).components;
const hireComponents = YAML.parse(hireComponentsFile).components;
const authComponents = YAML.parse(authComponentsFile).components;
const chatComponents = YAML.parse(chatComponentsFile).components;
const referralComponents = YAML.parse(referralComponentsFile).components;

// Combine all components into a single object
const components = {
  ...libraryComponents,
  ...settingComponents,
  ...projectComponents,
  ...notificationComponents,
  ...subscriptionComponents,
  ...userComponents,
  ...hireComponents,
  ...authComponents,
  ...chatComponents,
  ...referralComponents,
};

// Parse paths
const userPaths = YAML.parse(userPathsFile).paths;
const freelancerPaths = YAML.parse(freelancerPathsFile).paths;
const chatPaths = YAML.parse(chatPathsFile).paths;
const authPaths = YAML.parse(authPathsFile).paths;
const libraryPaths = YAML.parse(libraryPathsFile).paths;
const paymentPaths = YAML.parse(paymentPathsFile).paths;
const projectPaths = YAML.parse(projectPathsFile).paths;
const resourcePaths = YAML.parse(resourcePathsFile).paths;
const schedulePaths = YAML.parse(schedulePathsFile).paths;
const subscriptionPaths = YAML.parse(subscriptionPathsFile).paths;
const taskPaths = YAML.parse(taskPathsFile).paths;
const hirePaths = YAML.parse(hirePathsFile).paths;
const uploadPaths = YAML.parse(uploadPathsFile).paths;
const pricingPaths = YAML.parse(pricingPathsFile).paths;
const planPaths = YAML.parse(planPathsFile).paths;
const securityPaths = YAML.parse(securityPathsFile).paths;
const emailPaths = YAML.parse(emailPathsFile).paths;
const otpPaths = YAML.parse(otpPathsFile).paths;
const creditPaths = YAML.parse(creditPathsFile).paths;
const referralPaths = YAML.parse(referralPathsFile).paths;
const webhookPaths = YAML.parse(webhookPathsFile).paths;
const pmPaths = YAML.parse(pmPathsFile).paths;
const discountPaths = YAML.parse(discountPathsFile).paths;
const clientPaths = YAML.parse(clientPathsFile).paths;
const notificationPaths = YAML.parse(notificationPathsFile).paths;

// Combine all paths into a single object
const paths = {
  ...authPaths,
  ...userPaths,
  ...freelancerPaths,
  ...chatPaths,
  ...libraryPaths,
  ...paymentPaths,
  ...projectPaths,
  ...resourcePaths,
  ...schedulePaths,
  ...subscriptionPaths,
  ...taskPaths,
  ...hirePaths,
  ...uploadPaths,
  ...pricingPaths,
  ...planPaths,
  ...securityPaths,
  ...emailPaths,
  ...otpPaths,
  ...creditPaths,
  ...referralPaths,
  ...webhookPaths,
  ...pmPaths,
  ...discountPaths,
  ...clientPaths,
  ...notificationPaths,
};

const swaggerDef = {
  openapi: '3.0.0',
  info: {
    title: `${name} API documentation`,
    version,
    description,
    license: {
      name: 'MIT',
      url: 'localhost:4000',
    },
  },
  servers: [
    {
      url: `http://localhost:${config.port}/api/v1`,
      description: 'Development Server',
    },
  ],
  components,
  paths,
};

export default swaggerDef;
