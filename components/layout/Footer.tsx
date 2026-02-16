import { useSchool } from '../../lib/school-context'

export default function Footer() {
  const { school } = useSchool()
  const schoolName = school?.name || 'Sqoolify'

  return (
    <footer className="py-4 px-6 text-center text-xs text-gray-400 border-t border-gray-100">
      &copy; {new Date().getFullYear()} {schoolName}. All rights reserved.
    </footer>
  )
}
