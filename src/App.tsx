import './App.css'
import placeholder from './assets/placeholder.jpg'
import Card from './components/Card.tsx'

function App() {
  return (
    <div className="p-6">
      <div className="flex flex-wrap gap-8 justify-center">
        <Card
          role="Council Honorary Secretary"
          photo={placeholder}
          title="Alijah Saheba"
          name="Akber Mohammedamin"
          phone="630-660-1134"
          email="NoreenMerchant1@gmail.com"
        />
        <Card
          role="Council Honorary Secretary"
          photo={placeholder}
          title="Alijah Saheba"
          name="Akber Mohammedamin"
          phone="630-660-1134"
          email="NoreenMerchant1@gmail.com"
          showTeamButton={false}
        />
        <Card
          role="Council Honorary Secretary"
          title="Alijah Saheba"
          name="Akber Mohammedamin"
          phone="630-660-1134"
          email="NoreenMerchant1@gmail.com"
          showPhoto={false}
        />
        <Card
          role="Council Honorary Secretary"
          title="Alijah Saheba"
          name="Akber Mohammedamin"
          phone="630-660-1134"
          email="NoreenMerchant1@gmail.com"
          showPhoto={false}
          showTeamButton={false}
        />
        <Card
          role="Council Honorary Secretary"
          photo={placeholder}
          title="Alijah Saheba"
          name="Akber Mohammedamin"
          phone="630-660-1134"
          email="NoreenMerchant1@gmail.com"
        />
      </div>
    </div>
  )
}

export default App
