import { Context, requireAuth } from '../context';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env['AWS_REGION'] || 'us-east-1',
});

export const resolvers = {
  Query: {
    health: () => 'GraphQL API is running!',
    
    healthDb: async (_: any, __: any, context: Context) => {
      try {
        await context.prisma.$queryRaw`SELECT 1`;
        return 'Database connection successful!';
      } catch (error) {
        console.error('Database health check failed:', error);
        throw new Error('Database connection failed');
      }
    },

    me: async (_: any, __: any, context: Context) => {
      requireAuth(context);
      
      const user = await context.prisma.user.findUnique({
        where: { id: context.user!.id },
        include: { businesses: true }
      });
      
      if (!user) {
        throw new Error('User not found');
      }
      
      return {
        id: user.id,
        email: user.email,
        cognitoId: user.cognito_id,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        createdAt: user.created_at.toISOString(),
        updatedAt: user.updated_at.toISOString(),
        businesses: user.businesses.map(business => ({
          id: business.id,
          name: business.name,
          description: business.description,
          category: business.category,
          address: business.address,
          city: business.city,
          state: business.state,
          zipCode: business.zip_code,
          phone: business.phone,
          email: business.email,
          website: business.website,
          isActive: business.is_active,
          isClaimed: business.is_claimed,
          createdAt: business.created_at.toISOString(),
          updatedAt: business.updated_at.toISOString(),
        }))
      };
    },

    businesses: async (_: any, { first = 10, filters }: any, context: Context) => {
      const whereClause: any = { is_active: true };
      
      if (filters?.category) {
        whereClause.category = { contains: filters.category, mode: 'insensitive' };
      }
      
      if (filters?.city) {
        whereClause.city = { contains: filters.city, mode: 'insensitive' };
      }
      
      if (filters?.state) {
        whereClause.state = { contains: filters.state, mode: 'insensitive' };
      }
      
      if (filters?.search) {
        whereClause.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } }
        ];
      }

      const businesses = await context.prisma.business.findMany({
        where: whereClause,
        take: first,
        include: {
          users: true,
          business_images: true
        },
        orderBy: { created_at: 'desc' }
      });

      const totalCount = await context.prisma.business.count({ where: whereClause });

      return {
        edges: businesses.map(business => ({
          node: {
            id: business.id,
            name: business.name,
            description: business.description,
            category: business.category,
            address: business.address,
            city: business.city,
            state: business.state,
            zipCode: business.zip_code,
            phone: business.phone,
            email: business.email,
            website: business.website,
            isActive: business.is_active,
            isClaimed: business.is_claimed,
            createdAt: business.created_at.toISOString(),
            updatedAt: business.updated_at.toISOString(),
            owner: {
              id: business.users.id,
              email: business.users.email,
              cognitoId: business.users.cognito_id,
              firstName: business.users.first_name,
              lastName: business.users.last_name,
              role: business.users.role,
              createdAt: business.users.created_at.toISOString(),
              updatedAt: business.users.updated_at.toISOString(),
              businesses: []
            },
            images: business.business_images.map(image => ({
              id: image.id,
              url: image.image_url,
              key: image.image_key,
              alt: image.alt_text,
              isPrimary: image.is_primary,
              createdAt: image.created_at.toISOString(),
              updatedAt: image.updated_at.toISOString()
            }))
          },
          cursor: business.id
        })),
        pageInfo: {
          hasNextPage: businesses.length === first,
          hasPreviousPage: false
        },
        totalCount
      };
    },

    business: async (_: any, { id }: any, context: Context) => {
      const business = await context.prisma.business.findUnique({
        where: { id },
        include: {
          users: true,
          business_images: true
        }
      });

      if (!business) {
        throw new Error('Business not found');
      }

      return {
        id: business.id,
        name: business.name,
        description: business.description,
        category: business.category,
        address: business.address,
        city: business.city,
        state: business.state,
        zipCode: business.zip_code,
        phone: business.phone,
        email: business.email,
        website: business.website,
        isActive: business.is_active,
        isClaimed: business.is_claimed,
        createdAt: business.created_at.toISOString(),
        updatedAt: business.updated_at.toISOString(),
        owner: {
          id: business.users.id,
          email: business.users.email,
          cognitoId: business.users.cognito_id,
          firstName: business.users.first_name,
          lastName: business.users.last_name,
          role: business.users.role,
          createdAt: business.users.created_at.toISOString(),
          updatedAt: business.users.updated_at.toISOString(),
          businesses: []
        },
        images: business.business_images.map(image => ({
          id: image.id,
          url: image.image_url,
          key: image.image_key,
          alt: image.alt_text,
          isPrimary: image.is_primary,
          createdAt: image.created_at.toISOString(),
          updatedAt: image.updated_at.toISOString()
        }))
      };
    }
  },

  Mutation: {
    createBusiness: async (_: any, { input }: any, context: Context) => {
      requireAuth(context);

      const business = await context.prisma.business.create({
        data: {
          ...input,
          owner_id: context.user!.id,
          zip_code: input.zipCode,
          is_active: true,
          is_claimed: true,
          updated_at: new Date()
        },
        include: {
          users: true,
          business_images: true
        }
      });

      return {
        id: business.id,
        name: business.name,
        description: business.description,
        category: business.category,
        address: business.address,
        city: business.city,
        state: business.state,
        zipCode: business.zip_code,
        phone: business.phone,
        email: business.email,
        website: business.website,
        isActive: business.is_active,
        isClaimed: business.is_claimed,
        createdAt: business.created_at.toISOString(),
        updatedAt: business.updated_at.toISOString(),
        owner: {
          id: business.users.id,
          email: business.users.email,
          cognitoId: business.users.cognito_id,
          firstName: business.users.first_name,
          lastName: business.users.last_name,
          role: business.users.role,
          createdAt: business.users.created_at.toISOString(),
          updatedAt: business.users.updated_at.toISOString(),
          businesses: []
        },
        images: []
      };
    },

    updateBusiness: async (_: any, { id, input }: any, context: Context) => {
      requireAuth(context);

      // Check if user owns the business or is admin
      const existingBusiness = await context.prisma.business.findUnique({
        where: { id }
      });

      if (!existingBusiness) {
        throw new Error('Business not found');
      }

      if (existingBusiness.owner_id !== context.user!.id && context.user!.role !== 'ADMIN') {
        throw new Error('Not authorized to update this business');
      }

      const business = await context.prisma.business.update({
        where: { id },
        data: {
          ...input,
          zip_code: input.zipCode,
          updated_at: new Date()
        },
        include: {
          users: true,
          business_images: true
        }
      });

      return {
        id: business.id,
        name: business.name,
        description: business.description,
        category: business.category,
        address: business.address,
        city: business.city,
        state: business.state,
        zipCode: business.zip_code,
        phone: business.phone,
        email: business.email,
        website: business.website,
        isActive: business.is_active,
        isClaimed: business.is_claimed,
        createdAt: business.created_at.toISOString(),
        updatedAt: business.updated_at.toISOString(),
        owner: {
          id: business.users.id,
          email: business.users.email,
          cognitoId: business.users.cognito_id,
          firstName: business.users.first_name,
          lastName: business.users.last_name,
          role: business.users.role,
          createdAt: business.users.created_at.toISOString(),
          updatedAt: business.users.updated_at.toISOString(),
          businesses: []
        },
        images: business.business_images.map(image => ({
          id: image.id,
          url: image.image_url,
          key: image.image_key,
          alt: image.alt_text,
          isPrimary: image.is_primary,
          createdAt: image.created_at.toISOString(),
          updatedAt: image.updated_at.toISOString()
        }))
      };
    },

    deleteBusiness: async (_: any, { id }: any, context: Context) => {
      requireAuth(context);

      const existingBusiness = await context.prisma.business.findUnique({
        where: { id }
      });

      if (!existingBusiness) {
        throw new Error('Business not found');
      }

      if (existingBusiness.owner_id !== context.user!.id && context.user!.role !== 'ADMIN') {
        throw new Error('Not authorized to delete this business');
      }

      await context.prisma.business.delete({
        where: { id }
      });

      return true;
    },

    generateUploadUrl: async (_: any, { businessId, fileName, contentType }: any, context: Context) => {
      requireAuth(context);

      const fileExtension = fileName.split('.').pop();
      const key = `businesses/${businessId}/${Date.now()}.${fileExtension}`;

      try {
        const command = new PutObjectCommand({
          Bucket: process.env['S3_BUCKET_NAME'],
          Key: key,
          ContentType: contentType,
        });

        const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

        return { uploadUrl, key };
      } catch (error) {
        console.error('Error generating upload URL:', error);
        throw new Error('Failed to generate upload URL');
      }
    },

    addBusinessImage: async (_: any, { businessId, key, alt, isPrimary }: any, context: Context) => {
      requireAuth(context);

      const imageUrl = `https://${process.env['S3_BUCKET_NAME']}.s3.amazonaws.com/${key}`;

      const newImage = await context.prisma.businessImage.create({
        data: {
          business_id: businessId,
          image_url: imageUrl,
          image_key: key,
          alt_text: alt,
          is_primary: isPrimary || false,
          updated_at: new Date()
        }
      });

      return {
        id: newImage.id,
        url: newImage.image_url,
        key: newImage.image_key,
        alt: newImage.alt_text,
        isPrimary: newImage.is_primary,
        createdAt: newImage.created_at.toISOString(),
        updatedAt: newImage.updated_at.toISOString()
      };
    },

    deleteBusinessImage: async (_: any, { id }: any, context: Context) => {
      requireAuth(context);

      const image = await context.prisma.businessImage.findUnique({
        where: { id },
        include: { business: true }
      });

      if (!image) {
        throw new Error('Image not found');
      }

      if (image.business.owner_id !== context.user!.id && context.user!.role !== 'ADMIN') {
        throw new Error('Not authorized to delete this image');
      }

      await context.prisma.businessImage.delete({
        where: { id }
      });

      return true;
    }
  }
};