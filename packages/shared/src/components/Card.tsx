'use client'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  clickable?: boolean
}

const Card: React.FC<CardProps> = ({ children, className = '', clickable = false, ...props }) => {
  return (
    <div
      className={`
        bg-white rounded-lg shadow-md
        ${clickable ? 'cursor-pointer hover:shadow-lg transition-shadow duration-200' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '', ...props }) => (
  <div className={`px-6 py-4 border-b border-gray-200 ${className}`} {...props}>
    {children}
  </div>
)

interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const CardBody: React.FC<CardBodyProps> = ({ children, className = '', ...props }) => (
  <div className={`px-6 py-4 ${className}`} {...props}>
    {children}
  </div>
)

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const CardFooter: React.FC<CardFooterProps> = ({ children, className = '', ...props }) => (
  <div className={`px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg ${className}`} {...props}>
    {children}
  </div>
)

export default Card
export { CardHeader, CardBody, CardFooter }
